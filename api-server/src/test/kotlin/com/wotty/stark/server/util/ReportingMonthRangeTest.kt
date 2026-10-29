package com.wotty.stark.server.util

import java.time.LocalDateTime
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class ReportingMonthRangeTest {
    @Test
    fun `creates a half-open leap February range`() {
        val range = reportingMonthRange("2024-02")

        assertEquals(LocalDateTime.of(2024, 2, 1, 0, 0), range.start)
        assertEquals(LocalDateTime.of(2024, 3, 1, 0, 0), range.endExclusive)
    }

    @Test
    fun `rolls December into the next year`() {
        val range = reportingMonthRange("2025-12")

        assertEquals(LocalDateTime.of(2025, 12, 1, 0, 0), range.start)
        assertEquals(LocalDateTime.of(2026, 1, 1, 0, 0), range.endExclusive)
    }

    @Test
    fun `rejects malformed and out-of-range months`() {
        assertFailsWith<IllegalArgumentException> { reportingMonthRange("2026-1") }
        assertFailsWith<IllegalArgumentException> { reportingMonthRange("2026-13") }
        assertFailsWith<IllegalArgumentException> { reportingMonthRange("invalid") }
    }
}
