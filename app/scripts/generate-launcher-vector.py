"""Generate Android launcher VectorDrawables from app/public/logo.svg.

Android cannot load an SVG as a launcher resource. API 24+ supports gradient
colors in VectorDrawable; API 22/23 receive a solid-color vector fallback.
"""

from pathlib import Path
import re
import xml.etree.ElementTree as ET


APP_DIR = Path(__file__).resolve().parents[1]
SOURCE = APP_DIR / "public/logo.svg"
RESOURCES = APP_DIR / "android/app/src/main/res"
SVG = "{http://www.w3.org/2000/svg}"
ANDROID = "{http://schemas.android.com/apk/res/android}"
AAPT = "{http://schemas.android.com/aapt}"
ET.register_namespace("android", ANDROID[1:-1])
ET.register_namespace("aapt", AAPT[1:-1])


def color(value: str) -> str:
    if value.startswith("#"):
        if len(value) == 4:
            return "#" + "".join(char * 2 for char in value[1:])
        return value
    if value in {"black", "white"}:
        return "#000000" if value == "black" else "#ffffff"
    match = re.fullmatch(r"rgb\(([^,]+),([^,]+),([^,]+)\)", value)
    if not match:
        raise ValueError(f"Unsupported SVG color: {value}")
    components = (max(0, min(255, round(float(item)))) for item in match.groups())
    return "#" + "".join(f"{item:02x}" for item in components)


def average_gradient(gradient: ET.Element) -> str:
    stops = [color(stop.attrib["stop-color"]) for stop in gradient]
    channels = [round(sum(int(stop[index:index + 2], 16) for stop in stops) / len(stops)) for index in (1, 3, 5)]
    return "#" + "".join(f"{channel:02x}" for channel in channels)


def path_chunks(path_data: str) -> list[str]:
    """Keep pathData below Android's 32 KiB resource-string limit."""
    subpaths = [part for part in re.split(r"(?=M)", path_data) if part]
    chunks: list[str] = []
    current = ""
    for subpath in subpaths:
        if current and len(current) + len(subpath) > 30000:
            chunks.append(current)
            current = ""
        if len(subpath) > 30000:
            raise ValueError("A single SVG subpath exceeds Android's resource-string limit")
        current += subpath
    if current:
        chunks.append(current)
    return chunks


def add_path(parent: ET.Element, svg_path: ET.Element, gradients: dict[str, ET.Element], use_gradients: bool, stroke_width: str | None = None) -> None:
    for path_data in path_chunks(svg_path.attrib["d"]):
        add_path_chunk(parent, path_data, svg_path, gradients, use_gradients, stroke_width)


def add_path_chunk(parent: ET.Element, path_data: str, svg_path: ET.Element, gradients: dict[str, ET.Element], use_gradients: bool, stroke_width: str | None) -> None:
    output = ET.SubElement(parent, "path", {ANDROID + "pathData": path_data})
    fill = svg_path.attrib.get("fill", "none")
    if fill != "none":
        match = re.fullmatch(r"url\(#([^)]*)\)", fill)
        if match:
            gradient = gradients[match.group(1)]
            if use_gradients:
                attribute = ET.SubElement(output, AAPT + "attr", {"name": "android:fillColor"})
                vector_gradient = ET.SubElement(attribute, "gradient", {
                    ANDROID + "type": "linear",
                    ANDROID + "startX": gradient.attrib["x1"],
                    ANDROID + "startY": gradient.attrib["y1"],
                    ANDROID + "endX": gradient.attrib["x2"],
                    ANDROID + "endY": gradient.attrib["y2"],
                })
                for stop in gradient:
                    ET.SubElement(vector_gradient, "item", {
                        ANDROID + "offset": stop.attrib.get("offset", "0"),
                        ANDROID + "color": color(stop.attrib["stop-color"]),
                    })
            else:
                output.set(ANDROID + "fillColor", average_gradient(gradient))
        else:
            output.set(ANDROID + "fillColor", color(fill))
    stroke = svg_path.attrib.get("stroke", "none")
    if stroke != "none" and stroke_width:
        match = re.fullmatch(r"url\(#([^)]*)\)", stroke)
        output.set(ANDROID + "strokeColor", average_gradient(gradients[match.group(1)]) if match else color(stroke))
        output.set(ANDROID + "strokeWidth", stroke_width)


def create_vector(source: ET.Element, use_gradients: bool) -> ET.Element:
    view_box = source.attrib["viewBox"].split()
    width, height = view_box[2:]
    vector = ET.Element("vector", {
        ANDROID + "width": "108dp",
        ANDROID + "height": "108dp",
        ANDROID + "viewportWidth": width,
        ANDROID + "viewportHeight": height,
    })
    gradients = {item.attrib["id"]: item for item in source.iter(SVG + "linearGradient")}
    masks = {item.attrib["id"]: item.find(SVG + "path") for item in source.iter(SVG + "mask")}

    def copy_group(svg_group: ET.Element, parent: ET.Element) -> None:
        group = ET.SubElement(parent, "group")
        mask = svg_group.attrib.get("mask")
        if mask:
            mask_id = re.fullmatch(r"url\(#([^)]*)\)", mask).group(1)
            ET.SubElement(group, "clip-path", {ANDROID + "pathData": masks[mask_id].attrib["d"]})
        stroke_width = svg_group.attrib.get("stroke-width")
        for child in svg_group:
            if child.tag == SVG + "rect":
                x = child.attrib.get("x", "0")
                y = child.attrib.get("y", "0")
                width = child.attrib["width"]
                height = child.attrib["height"]
                rectangle = ET.Element(SVG + "path", {"d": f"M{x} {y}h{width}v{height}h-{width}Z", "fill": child.attrib["fill"]})
                add_path(group, rectangle, gradients, use_gradients, stroke_width)
            elif child.tag == SVG + "path":
                add_path(group, child, gradients, use_gradients, stroke_width)
            elif child.tag == SVG + "g":
                copy_group(child, group)

    for group in source.findall(SVG + "g"):
        copy_group(group, vector)
    return vector


def main() -> None:
    source = ET.parse(SOURCE).getroot()
    for directory, gradients in (("drawable", False), ("drawable-v24", True)):
        destination = RESOURCES / directory / "ic_launcher_vector.xml"
        destination.parent.mkdir(parents=True, exist_ok=True)
        vector = create_vector(source, gradients)
        ET.indent(vector, space="    ")
        ET.ElementTree(vector).write(destination, encoding="utf-8", xml_declaration=True)
        print(destination)


if __name__ == "__main__":
    main()
