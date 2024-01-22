import { captializeRank, convertCapsWithSpacingToCamelCaseWithSpacing } from "./text";
import { format, parse, getWeekOfMonth, getDay } from 'date-fns';

export type Attendance = {
    name: string;
    attendanceStatus: string;
    branch: string;
}

export class Parade {
    private readonly rawText: string;
    private readonly paradeDate: Date;

    constructor(rawText: string, date: Date) {
        this.rawText = rawText;
        this.paradeDate = date;
    }

    getAttendances(): Attendance[] {
        function parse(section: string): Attendance[] {
            const branchRegex = /.+:.*[0-9]+\/[0-9]+/;
            let branch = '';
            const lines = section.split('\n');
            const users: Attendance[] = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line === "") {
                    continue; // Skip empty lines
                }

                if (line.match(branchRegex)) {
                    const parts = line.split(':');
                    console.log(parts[0]);
                    branch = parts[0];
                    continue;
                }

                const parts = line.split('-');

                if (parts.length < 2) {
                    continue;
                }

                // Is MC section
                const startsWithNumber = /^\d/.test(parts[1].trim());
                if (startsWithNumber) {
                    continue;
                }

                const name = captializeRank(
                    convertCapsWithSpacingToCamelCaseWithSpacing(parts[0].trim())
                );
                const attendanceStatus = parts[1].trim().toUpperCase();
                users.push({ name, attendanceStatus, branch });
            }

            return users;
        }

        return parse(this.rawText);
    }

    getParadeDate(): Date {
        return this.paradeDate;
    }

    getFormattedParadeDate(): string {
        return formatWithPeriod(this.paradeDate);
    }

    getParadeMonthandWeek(): string {
        return formatWithWeekofMonth(this.paradeDate);
    }
}

function formatWithPeriod(date: Date) {
    const hour = date.getHours();
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${format(date, 'dd MMM')} (${period})`;
}

function formatWithWeekofMonth(date: Date): string {
    const formattedDate = format(date, 'MMMM yyyy');
    const weekNumber = getWeekOfMonth(date);
    const formattedCustomDate = `${formattedDate} (Week ${weekNumber})`;

    return formattedCustomDate;
}