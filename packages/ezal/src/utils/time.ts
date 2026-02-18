import { Temporal } from '@js-temporal/polyfill';
import * as chrono from 'chrono-node';
import { getConfig } from '../config';
import { TIME_ZONE_ID } from './consts';

//#region timezone

let cacheTimezone: string | undefined;
function timezone(): string {
	if (cacheTimezone) return cacheTimezone;
	cacheTimezone = getConfig()?.site.timezone ?? Temporal.Now.timeZoneId();
	return cacheTimezone;
}

//#region now

function now(): Temporal.ZonedDateTime {
	return Temporal.Now.zonedDateTimeISO(timezone());
}

//#region from

function from(timestamp: number, timezone?: string): Temporal.ZonedDateTime {
	if (!timezone)
		timezone = getConfig().site.timezone ?? Temporal.Now.timeZoneId();
	return Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(
		timezone!,
	);
}

//#region parseDate

type ChronoParser = (
	input: string,
	ref?: chrono.ParsingReference,
) => Date | null;

const CHRONO_PARSERS: Record<string, ChronoParser> = {
	en: chrono.en.parseDate,
	de: chrono.de.parseDate,
	fr: chrono.fr.parseDate,
	ja: chrono.ja.parseDate,
	pt: chrono.pt.parseDate,
	nl: chrono.nl.parseDate,
	zh: chrono.zh.parseDate,
	ru: chrono.ru.parseDate,
	es: chrono.es.parseDate,
	uk: chrono.uk.parseDate,
	it: (input, ref) => chrono.it.parseDate(input, ref?.instant),
	sv: chrono.sv.parseDate,
};

const PATTERN_REGEX_ESC = /[.*+?^${}()|[\]\\]/g;
const PATTERN_NUM_YYMMDD = /^\d\d(0\d|1[0-2])([01]\d|3[01])$/;
const PATTERN_NUM_YYYYMMDD = /^20\d\d(0\d|1[0-2])([01]\d|3[01])$/;
const PATTERN_NUM_SECONDS = /^\d{10}$/;
const PATTERN_NUM_MILLISECONDS = /^\d{13}$/;
const PATTERN_TIMEZONE = new RegExp(
	TIME_ZONE_ID.map((id: string) =>
		id.replace(PATTERN_REGEX_ESC, (c) => `\\${c}`),
	).join('|'),
);

function parseYYMMDD(input: string): Temporal.ZonedDateTime | null {
	if (!PATTERN_NUM_YYMMDD.test(input)) return null;
	const timeZone = getConfig().site.timezone ?? Temporal.Now.timeZoneId();
	const year = parseInt(input.slice(0, 2)) + 2000;
	const month = parseInt(input.slice(2, 4));
	const day = parseInt(input.slice(4));
	try {
		return Temporal.ZonedDateTime.from({ year, month, day, timeZone });
	} catch {
		return null;
	}
}

function parseYYYYMMDD(input: string): Temporal.ZonedDateTime | null {
	if (!PATTERN_NUM_YYYYMMDD.test(input)) return null;
	const timeZone = getConfig().site.timezone ?? Temporal.Now.timeZoneId();
	const year = parseInt(input.slice(0, 4));
	const month = parseInt(input.slice(4, 6));
	const day = parseInt(input.slice(6));
	try {
		return Temporal.ZonedDateTime.from({ year, month, day, timeZone });
	} catch {
		return null;
	}
}

function parseSeconds(input: string): Temporal.ZonedDateTime | null {
	if (!PATTERN_NUM_SECONDS.test(input)) return null;
	try {
		return from(parseInt(input) * 1000);
	} catch {
		return null;
	}
}

function parseMilliseconds(input: string): Temporal.ZonedDateTime | null {
	if (!PATTERN_NUM_MILLISECONDS.test(input)) return null;
	try {
		return from(parseInt(input));
	} catch {
		return null;
	}
}

const PATTERN_DIFF = /(\d+)\s*(d|day|days|m|month|months|y|year|years)/gi;
function extractDiff(
	input: string,
): [days: number, months: number, years: number] {
	let days = 0;
	let months = 0;
	let years = 0;
	for (const [_, num, type] of input.matchAll(PATTERN_DIFF)) {
		const d = Number(num);
		if (!Number.isFinite(d)) continue;
		switch (type[0].toLowerCase()) {
			case 'd':
				days += d;
				continue;
			case 'm':
				months += d;
				continue;
			case 'y':
				years += d;
				continue;
		}
	}
	return [days, months, years];
}

function parseDiff(
	input: string,
	ref?: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime | null {
	if (!ref) return null;
	const [days, months, years] = extractDiff(input);
	if (days + months + years === 0) return null;
	const duration = Temporal.Duration.from({ days, months, years });
	return ref.add(duration);
}

function findTimeZone(input: string): string | undefined {
	return input.match(PATTERN_TIMEZONE)?.[0];
}

let chronoFallbacks: ChronoParser[] | undefined;

function getChronoFallbacks(): ChronoParser[] {
	if (chronoFallbacks) return chronoFallbacks;
	const language = getConfig().site.language.split('-', 1)[0];
	const fallbacks: ChronoParser[] = [];
	if (language in CHRONO_PARSERS) {
		fallbacks.push(CHRONO_PARSERS[language]);
	}
	for (const [lang, parser] of Object.entries(CHRONO_PARSERS)) {
		if (lang === language) continue;
		fallbacks.push(parser);
	}
	chronoFallbacks = fallbacks;
	return fallbacks;
}

function parseDate(
	input: any,
	ref?: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime | null {
	if (!input || typeof input === 'object') return null;
	if (typeof input === 'number') {
		input = input.toString();
		return (
			parseYYMMDD(input) ??
			parseYYYYMMDD(input) ??
			parseSeconds(input) ??
			parseMilliseconds(input)
		);
	}
	if (typeof input !== 'string') return null;
	const numDate =
		parseYYMMDD(input) ??
		parseYYYYMMDD(input) ??
		parseSeconds(input) ??
		parseMilliseconds(input);
	if (numDate) return numDate;
	let date: Date | null = null;
	let chronoRef: chrono.ParsingReference | undefined;
	if (ref)
		chronoRef = {
			instant: new Date(ref.epochMilliseconds),
			timezone: ref.timeZoneId,
		};
	for (const parser of getChronoFallbacks()) {
		date = parser(input, chronoRef);
		if (date) break;
	}
	if (!date) return parseDiff(input, ref);
	return from(date.getTime(), findTimeZone(input));
}

export const Time = {
	now,
	timezone,
	from,
	parseDate,
};
