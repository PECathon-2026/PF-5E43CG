/* ===================================================
   Moon Phase Calculator & Visual Display
   Calculates lunar cycle, illumination, and renders
   the floating moon widget in the header.
   =================================================== */

const MoonPhase = (() => {
    'use strict';

    /**
     * Calculate current lunar phase (0.0 to 1.0)
     * Known reference new moon: Jan 6, 2000, 18:14 UTC
     */
    function calculate(date = new Date()) {
        const knownNewMoon = new Date('2000-01-06T18:14:00Z');
        const synodicMonth = 29.53058867; // days in average lunar cycle

        const diffDays = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
        const cycle = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
        return cycle / synodicMonth; // 0.0 to 1.0
    }

    function getName(phase) {
        if (phase < 0.0625) return 'New Moon';
        if (phase < 0.1875) return 'Waxing Crescent';
        if (phase < 0.3125) return 'First Quarter';
        if (phase < 0.4375) return 'Waxing Gibbous';
        if (phase < 0.5625) return 'Full Moon';
        if (phase < 0.6875) return 'Waning Gibbous';
        if (phase < 0.8125) return 'Last Quarter';
        if (phase < 0.9375) return 'Waning Crescent';
        return 'New Moon';
    }

    function getEmoji(phase) {
        if (phase < 0.0625) return '🌑';
        if (phase < 0.1875) return '🌒';
        if (phase < 0.3125) return '🌓';
        if (phase < 0.4375) return '🌔';
        if (phase < 0.5625) return '🌕';
        if (phase < 0.6875) return '🌖';
        if (phase < 0.8125) return '🌗';
        if (phase < 0.9375) return '🌘';
        return '🌑';
    }

    /**
     * Approximate illumination percentage (0% at New Moon to 100% at Full Moon)
     */
    function getIllumination(phase) {
        // Peaks at phase = 0.5 (Full Moon)
        const illum = (1 - Math.cos(2 * Math.PI * phase)) / 2;
        return Math.round(illum * 100);
    }

    /**
     * Render the floating moon display
     */
    function render() {
        const phase = calculate();
        const name = getName(phase);
        const emoji = getEmoji(phase);
        const illum = getIllumination(phase);

        const moonDisc = document.getElementById('moonDisc') || document.getElementById('moonBody');
        const moonName = document.getElementById('moonName') || document.getElementById('moonLabel');
        const moonIllum = document.getElementById('moonIllum');
        const moonFloat = document.getElementById('moonPhaseFloat');

        if (moonName) moonName.textContent = name;
        if (moonIllum) moonIllum.textContent = `${illum}% Illum`;
        if (moonFloat) moonFloat.title = `${name} (${illum}% illuminated)`;

        if (moonDisc) {
            // Visual dynamic shadow representation
            moonDisc.innerHTML = `<span style="font-size: 28px; line-height: 1;">${emoji}</span>`;
        }

        return {
            phase,
            name,
            emoji,
            illum
        };
    }

    return {
        calculate,
        getName,
        getEmoji,
        getIllumination,
        render
    };
})();
