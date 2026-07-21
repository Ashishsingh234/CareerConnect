require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/db');
require('./src/models/Job');
require('./src/models/Company');

async function run() {
    try {
        await connectDB();
        const Job = mongoose.model('Job');
        const Company = mongoose.model('Company');

        const count = await Job.countDocuments();
        console.log(`Total jobs in DB: ${count}`);

        if (count > 0) {
            const jobs = await Job.find().populate('company', 'name location');
            console.log('Jobs:');
            jobs.forEach(j => {
                console.log(`- Title: ${j.title}, Company: ${j.company?.name || 'N/A'}, Location: ${j.location}, isRemote: ${j.isRemote}`);
            });
        }

        const companyCount = await Company.countDocuments();
        console.log(`Total companies in DB: ${companyCount}`);
        if (companyCount > 0) {
            const companies = await Company.find();
            console.log('Companies:');
            companies.forEach(c => {
                console.log(`- Name: ${c.name}, Location: ${c.location}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
