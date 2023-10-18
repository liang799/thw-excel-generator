import { captializeRank, convertCapsWithSpacingToCamelCaseWithSpacing } from "./text";

export type Attendance = {
    name: string;
    attendanceStatus: string;
}

export class Parade {
    private readonly rawText: string;

    constructor(rawText: string) {
        this.rawText = rawText;
    }

    getAttendances(): Attendance[] {
        function parseSection(section: string): Attendance[] {
            const lines = section.split('\n');
            const users: Attendance[] = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line === "") {
                    continue; // Skip empty lines
                }

                const parts = line.split('-');

                if (parts.length < 2) {
                    continue;
                }

                const startsWithNumber = /^\d/.test(parts[1].trim());
                if (startsWithNumber) {
                    continue;
                }

                const name = captializeRank(
                    convertCapsWithSpacingToCamelCaseWithSpacing(parts[0].trim())
                );
                const attendanceStatus = parts[1].trim().toUpperCase();
                users.push({ name, attendanceStatus });
            }

            return users;
        }


        const sections = this.rawText.split('\n\n');
        const usersArray = sections.reduce((acc: any[], section: string) => {
            const users = parseSection(section);
            return acc.concat(users);
        }, []);

        return usersArray;
    }
}
