"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SURFACE_WIDTH = 370;
const SURFACE_HEIGHT = 170;
const CARD_CURVE_TOP = 108;
const CARD_NOTCH_RADIUS = 7;
const CURVE_GAP = 3;
const SALARY_CURVE_TOP = CARD_CURVE_TOP + CURVE_GAP;
const SALARY_LEADING_CORNER_RADIUS = 4;
const SALARY_LEADING_CORNER_STEPS = 1;

type Point = readonly [number, number];
type CubicCurve = readonly [Point, Point, Point, Point];

const CARD_CURVES: readonly CubicCurve[] = [
  [[326, CARD_CURVE_TOP], [304, CARD_CURVE_TOP], [285, 113], [270, 122]],
  [[270, 122], [252, 133], [246, 148], [241, 158]],
  [[241, 158], [237, 166], [233, 170], [224, 170]],
];

function cubicPoint([p0, p1, p2, p3]: CubicCurve, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return [
    mt2 * mt * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t2 * t * p3[0],
    mt2 * mt * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t2 * t * p3[1],
  ];
}

function cubicTangent([p0, p1, p2, p3]: CubicCurve, t: number): Point {
  const mt = 1 - t;
  return [
    3 * mt * mt * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * mt * mt * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
}

function salaryCurvePoints() {
  const points: Point[] = [];
  CARD_CURVES.slice(0, 2).forEach((curve, curveIndex) => {
    const steps = 32;
    for (let index = curveIndex === 0 ? 0 : 1; index <= steps; index += 1) {
      const t = index / steps;
      const [x, y] = cubicPoint(curve, t);
      const [dx, dy] = cubicTangent(curve, t);
      const length = Math.hypot(dx, dy) || 1;
      points.push([x + (dy / length) * CURVE_GAP, y + (-dx / length) * CURVE_GAP]);
    }
  });
  return points;
}

function appendCardCurve(shape: any) {
  CARD_CURVES.forEach(([, control1, control2, end]) => {
    shape.bezierCurveTo(control1[0], control1[1], control2[0], control2[1], end[0], end[1]);
  });
}

function createCardShape() {
  const shape = new THREE.Shape();
  shape.moveTo(20, 0);
  shape.lineTo(350, 0);
  shape.quadraticCurveTo(370, 0, 370, 20);
  shape.lineTo(370, CARD_CURVE_TOP - CARD_NOTCH_RADIUS);
  shape.quadraticCurveTo(370, CARD_CURVE_TOP, 370 - CARD_NOTCH_RADIUS, CARD_CURVE_TOP);
  shape.lineTo(326, CARD_CURVE_TOP);
  appendCardCurve(shape);
  shape.lineTo(20, 170);
  shape.quadraticCurveTo(0, 170, 0, 150);
  shape.lineTo(0, 20);
  shape.quadraticCurveTo(0, 0, 20, 0);
  shape.closePath();
  return shape;
}

function createSalaryShape() {
  const curvePoints = salaryCurvePoints();
  const first = curvePoints[0];
  const leadingCornerPoint = curvePoints[SALARY_LEADING_CORNER_STEPS];
  const previous = curvePoints[curvePoints.length - 2];
  const last = curvePoints[curvePoints.length - 1];
  const incomingX = last[0] - previous[0];
  const incomingY = last[1] - previous[1];
  const incomingLength = Math.hypot(incomingX, incomingY) || 1;
  const capRadius = 7;
  const bottomJoinX = last[0] + 13;
  const shape = new THREE.Shape();
  shape.moveTo(leadingCornerPoint[0], leadingCornerPoint[1]);
  curvePoints.slice(SALARY_LEADING_CORNER_STEPS + 1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.bezierCurveTo(
    last[0] + (incomingX / incomingLength) * capRadius,
    last[1] + (incomingY / incomingLength) * capRadius,
    last[0] - 2,
    SURFACE_HEIGHT,
    bottomJoinX,
    SURFACE_HEIGHT,
  );
  shape.lineTo(350, 170);
  shape.quadraticCurveTo(370, 170, 370, 150);
  shape.lineTo(370, 136);
  shape.quadraticCurveTo(370, SALARY_CURVE_TOP, 350, SALARY_CURVE_TOP);
  shape.lineTo(first[0] + SALARY_LEADING_CORNER_RADIUS, first[1]);
  shape.quadraticCurveTo(first[0], first[1], leadingCornerPoint[0], leadingCornerPoint[1]);
  shape.closePath();
  return shape;
}

function createGradientMaterial(topColor: string, bottomColor: string, startY = 0, endY = SURFACE_HEIGHT) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      topColor: { value: new THREE.Color(topColor) },
      bottomColor: { value: new THREE.Color(bottomColor) },
      gradientStartY: { value: startY },
      gradientEndY: { value: endY },
    },
    vertexShader: `
      varying float vSurfaceY;
      void main() {
        vSurfaceY = position.y / ${SURFACE_HEIGHT.toFixed(1)};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float gradientStartY;
      uniform float gradientEndY;
      varying float vSurfaceY;
      void main() {
        float gradient = clamp(
          (vSurfaceY * ${SURFACE_HEIGHT.toFixed(1)} - gradientStartY) / (gradientEndY - gradientStartY),
          0.0,
          1.0
        );
        vec3 color = mix(topColor, bottomColor, smoothstep(0.0, 1.0, gradient));
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

function createOutline(shape: any) {
  const points = shape.getPoints(180).map((point: { x: number; y: number }) => new THREE.Vector3(point.x, point.y, 2));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.96,
  });
  return new THREE.LineLoop(geometry, material);
}

export function SalaryHeroSurface() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      0,
      SURFACE_WIDTH,
      0,
      SURFACE_HEIGHT,
      -100,
      100,
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.className = "stark-hero-three-canvas";
    host.appendChild(renderer.domElement);

    const cardShape = createCardShape();
    const salaryShape = createSalaryShape();
    const cardGeometry = new THREE.ShapeGeometry(cardShape);
    const salaryGeometry = new THREE.ShapeGeometry(salaryShape);
    const cardMaterial = createGradientMaterial("#dcf0ff", "#e2f8f0");
    const salaryMaterial = createGradientMaterial("#dcf0ff", "#e2f8f0");
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    const salaryMesh = new THREE.Mesh(salaryGeometry, salaryMaterial);
    const cardOutline = createOutline(cardShape);
    const salaryOutline = createOutline(salaryShape);

    cardMesh.position.z = 0;
    salaryMesh.position.z = 3;
    cardOutline.position.z = 4;
    salaryOutline.position.z = 5;
    scene.add(cardMesh, salaryMesh, cardOutline, salaryOutline);

    const render = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(host);
    render();

    return () => {
      resizeObserver.disconnect();
      cardGeometry.dispose();
      salaryGeometry.dispose();
      cardMaterial.dispose();
      salaryMaterial.dispose();
      cardOutline.geometry.dispose();
      salaryOutline.geometry.dispose();
      (cardOutline.material as any).dispose();
      (salaryOutline.material as any).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="stark-hero-three-surface" aria-hidden="true" />;
}
