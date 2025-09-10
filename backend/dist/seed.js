"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    // Create admin user
    const adminPassword = await bcrypt_1.default.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@idfinder.gh' },
        update: {},
        create: {
            name: 'System Administrator',
            email: 'admin@idfinder.gh',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });
    // Create sample locations
    const locations = [
        {
            name: 'Accra Central Police Station',
            address: 'High Street, Accra',
            region: 'Greater Accra',
            phone: '+233 30 222 1000',
            hours: '24/7',
        },
        {
            name: 'Kumasi Central Police Station',
            address: 'Prempeh II Street, Kumasi',
            region: 'Ashanti',
            phone: '+233 32 202 0000',
            hours: '24/7',
        },
        {
            name: 'Tamale Central Police Station',
            address: 'Central Market Road, Tamale',
            region: 'Northern',
            phone: '+233 37 202 0000',
            hours: '24/7',
        },
        {
            name: 'Accra Passport Office',
            address: 'Independence Avenue, Accra',
            region: 'Greater Accra',
            phone: '+233 30 222 2000',
            hours: 'Mon-Fri 8AM-5PM',
        },
        {
            name: 'DVLA Accra Office',
            address: 'Ring Road East, Accra',
            region: 'Greater Accra',
            phone: '+233 30 222 3000',
            hours: 'Mon-Fri 8AM-4PM',
        },
    ];
    for (const location of locations) {
        const existing = await prisma.location.findFirst({
            where: { name: location.name }
        });
        if (!existing) {
            await prisma.location.create({
                data: location
            });
        }
    }
    console.log('Seed data created successfully!');
    console.log('Admin login: admin@idfinder.gh / admin123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
