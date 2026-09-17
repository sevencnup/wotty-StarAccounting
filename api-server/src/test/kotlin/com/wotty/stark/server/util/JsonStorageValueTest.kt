package com.wotty.stark.server.util

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class JsonStorageValueTest {
    @Test
    fun `stores JSON string fields without adding a second layer of JSON quotes`() {
        val config = "{\"frequency\":\"MONTHLY\"}"

        assertEquals(config, rawJsonStorageValue(JsonPrimitive(config)))
        assertEquals(config, rawJsonStorageValue(Json.parseToJsonElement(config)))
    }

    @Test
    fun `keeps null JSON fields as null`() {
        assertNull(rawJsonStorageValue(JsonNull))
    }
}
