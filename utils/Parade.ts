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
        function parseSection(section: string): any[] {
            const lines = section.split('\n');
            const users: Attendance[] = [];

            if (!lines[0].includes("/")) return users;

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split('-');

                if (parts.length < 2) { continue; }

                const name = parts[0].trim();
                const attendanceStatus = parts[1].trim();
                users.push({ name, attendanceStatus });
            }

            return users;
        };

      const sections = this.rawText.split('\n\n');
        const usersArray = sections.reduce((acc: any[], section: string) => {
            const users = parseSection(section);
            return acc.concat(users);
        }, []);
        return usersArray;
    }
}
