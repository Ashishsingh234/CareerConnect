/**
 * Seed Script: Creates 25 demo job listings across 8 companies.
 * Run with: node scripts/seedJobs.js
 */
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerconnect';

// ── Inline schemas (avoids loading whole server) ──────────────────────────────
const companySchema = new mongoose.Schema({
    name: String, description: String, website: String,
    industry: String, location: String, logoFileId: mongoose.Schema.Types.ObjectId,
    address: String, cultureDescription: String, benefits: [String],
    socialLinks: { linkedin: String, twitter: String },
    createdBy: mongoose.Schema.Types.ObjectId,
    hrAccounts: [mongoose.Schema.Types.ObjectId]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const userSchema = new mongoose.Schema({
    name: String, email: { type: String, unique: true },
    password: String, role: String, companyId: mongoose.Schema.Types.ObjectId
});

const jobSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    requiredSkills: [String],
    responsibilities: [String],
    requirements: [String],
    salaryRange: { min: Number, max: Number },
    vacancy: Number,
    isRemote: { type: Boolean, default: false },
    workMode: { type: String, default: 'Onsite' },
    jobType: { type: String, default: 'Fulltime' },
    experienceLevel: String,
    location: String,
    deadline: Date,
    createdAt: { type: Date, default: Date.now }
});

// ── Demo data ─────────────────────────────────────────────────────────────────
const COMPANIES = [
    { name: 'TechNova Solutions', industry: 'Technology', location: 'Bangalore, India', description: 'Leading software product company building AI-powered enterprise solutions.' },
    { name: 'DesignHub Studio', industry: 'Design', location: 'Mumbai, India', description: 'Award-winning design studio crafting world-class digital experiences.' },
    { name: 'FinCore Analytics', industry: 'Finance', location: 'Hyderabad, India', description: 'Next-gen financial analytics platform trusted by 200+ enterprises.' },
    { name: 'GreenMark Corp', industry: 'Marketing', location: 'Pune, India', description: 'Digital marketing agency specialising in growth for D2C brands.' },
    { name: 'CloudBase Inc', industry: 'Cloud', location: 'Chennai, India', description: 'Cloud infrastructure and DevOps solutions for fast-growing startups.' },
    { name: 'EduPath Learning', industry: 'Education', location: 'Delhi, India', description: 'Online education platform with 1M+ learners across 60 countries.' },
    { name: 'HealthBridge Tech', industry: 'HealthTech', location: 'Noida, India', description: 'Building connected health ecosystems through AI and IoT.' },
    { name: 'RetailEdge Systems', industry: 'Retail Tech', location: 'Gurgaon, India', description: 'Omnichannel retail technology for modern commerce.' },
];

const JOB_TEMPLATES = [
    // TechNova Solutions
    {
        title: 'Senior Full Stack Developer', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Senior', location: 'Bangalore, India',
        salaryRange: { min: 1800000, max: 2800000 }, vacancy: 2,
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
        description: 'We are looking for a Senior Full Stack Developer to join our growing engineering team. You will be responsible for building and maintaining scalable web applications that serve millions of users.',
        responsibilities: ['Design and develop high-quality software', 'Collaborate with cross-functional teams', 'Mentor junior developers', 'Participate in code reviews'],
        requirements: ['5+ years of full stack development experience', 'Strong knowledge of React and Node.js', 'Experience with cloud services (AWS/GCP)', 'Excellent problem-solving skills'],
    },
    {
        title: 'DevOps Engineer', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Mid', location: 'Bangalore, India',
        salaryRange: { min: 1200000, max: 1800000 }, vacancy: 1,
        requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS'],
        description: 'Join our infrastructure team to build and scale our cloud platform that powers products used by millions of customers daily.',
        responsibilities: ['Manage CI/CD pipelines', 'Monitor system performance', 'Automate infrastructure deployment', 'Ensure system reliability and uptime'],
        requirements: ['3+ years of DevOps experience', 'Strong knowledge of Kubernetes and Docker', 'Experience with infrastructure as code', 'Scripting in Bash/Python'],
    },
    {
        title: 'ML Engineer', jobType: 'Fulltime', workMode: 'Remote',
        experienceLevel: 'Senior', location: 'Remote, India', isRemote: true,
        salaryRange: { min: 2000000, max: 3200000 }, vacancy: 1,
        requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'SQL'],
        description: 'Build and deploy machine learning models at scale. You will work on cutting-edge AI features that power our flagship product.',
        responsibilities: ['Develop and train ML models', 'Deploy models to production', 'Monitor model performance', 'Collaborate with data engineering teams'],
        requirements: ['4+ years of ML engineering experience', 'Proficiency in Python and ML frameworks', 'Experience with MLOps and model serving', 'Strong mathematical foundation'],
    },
    // DesignHub Studio
    {
        title: 'UI/UX Designer', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Mid', location: 'Mumbai, India',
        salaryRange: { min: 800000, max: 1400000 }, vacancy: 2,
        requiredSkills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
        description: 'Create beautiful, intuitive interfaces for our diverse portfolio of enterprise and consumer products. Work directly with product and engineering teams.',
        responsibilities: ['Create wireframes and prototypes', 'Conduct user research', 'Build and maintain design systems', 'Collaborate with developers for implementation'],
        requirements: ['3+ years of UI/UX design experience', 'Proficiency in Figma', 'Strong portfolio of mobile and web designs', 'Experience with user testing'],
    },
    {
        title: 'Graphic Designer', jobType: 'Partime', workMode: 'Remote',
        experienceLevel: 'Fresher', location: 'Remote, India', isRemote: true,
        salaryRange: { min: 300000, max: 600000 }, vacancy: 3,
        requiredSkills: ['Illustrator', 'Photoshop', 'Figma', 'Canva', 'Motion Graphics'],
        description: 'Create compelling visual assets for our brand campaigns, social media, and marketing materials.',
        responsibilities: ['Design social media content', 'Create brand assets', 'Design email templates', 'Support the marketing team with visual content'],
        requirements: ['Strong design portfolio', 'Proficiency in Adobe Creative Suite', 'Good eye for typography and colour', 'Ability to meet deadlines'],
    },
    {
        title: 'Product Designer', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Senior', location: 'Mumbai, India',
        salaryRange: { min: 1600000, max: 2600000 }, vacancy: 1,
        requiredSkills: ['Figma', 'Product Strategy', 'User Research', 'Interaction Design', 'Accessibility'],
        description: 'Lead the product design practice for our flagship consumer app with 500K+ active users. Shape the future direction of our design language.',
        responsibilities: ['Lead end-to-end product design', 'Define product vision with stakeholders', 'Drive design strategy', 'Build and mentor design team'],
        requirements: ['5+ years of product design experience', 'Strong systems thinking', 'Experience leading design teams', 'Deep user empathy and research skills'],
    },
    // FinCore Analytics
    {
        title: 'Data Analyst', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Mid', location: 'Hyderabad, India',
        salaryRange: { min: 900000, max: 1500000 }, vacancy: 2,
        requiredSkills: ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel'],
        description: 'Drive business intelligence and analytics for our financial products. Transform complex data into actionable insights for product and leadership teams.',
        responsibilities: ['Build and maintain dashboards', 'Analyse user behaviour data', 'Create automated reports', 'Collaborate with product teams'],
        requirements: ['2+ years of data analysis experience', 'Strong SQL skills', 'Experience with BI tools', 'Statistical analysis knowledge'],
    },
    {
        title: 'Backend Engineer (Java)', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Senior', location: 'Hyderabad, India',
        salaryRange: { min: 1700000, max: 2700000 }, vacancy: 1,
        requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'PostgreSQL'],
        description: 'Design and build high-throughput backend services for our real-time financial data platform processing 10M+ transactions per day.',
        responsibilities: ['Design microservices architecture', 'Build high-performance APIs', 'Optimise database queries', 'Ensure system scalability'],
        requirements: ['6+ years of Java development', 'Deep knowledge of Spring Boot', 'Hands-on experience with Kafka', 'Understanding of financial systems'],
    },
    {
        title: 'Quant Analyst', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Senior', location: 'Hyderabad, India',
        salaryRange: { min: 2500000, max: 4000000 }, vacancy: 1,
        requiredSkills: ['Python', 'R', 'Financial Modelling', 'Statistics', 'Bloomberg'],
        description: 'Develop quantitative models and algorithms for risk assessment and portfolio optimisation for our institutional clients.',
        responsibilities: ['Develop pricing models', 'Build risk frameworks', 'Analyse market data', 'Collaborate with trading teams'],
        requirements: ['PhD or Masters in Finance/Math/Statistics', '5+ years of quantitative finance experience', 'Strong programming skills in Python/R', 'Deep knowledge of financial derivatives'],
    },
    // GreenMark Corp
    {
        title: 'Digital Marketing Manager', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Mid', location: 'Pune, India',
        salaryRange: { min: 900000, max: 1600000 }, vacancy: 1,
        requiredSkills: ['SEO', 'Google Ads', 'Meta Ads', 'Analytics', 'Content Strategy'],
        description: 'Lead our digital marketing efforts for a growing portfolio of D2C brands. Manage ₹2Cr+ monthly ad spend across paid and organic channels.',
        responsibilities: ['Plan and execute digital campaigns', 'Manage paid advertising', 'Track and report on KPIs', 'Lead content marketing strategy'],
        requirements: ['4+ years of digital marketing experience', 'Hands-on experience with Google and Meta Ads', 'Strong analytical skills', 'Experience managing large budgets'],
    },
    {
        title: 'SEO Specialist', jobType: 'Fulltime', workMode: 'Remote',
        experienceLevel: 'Fresher', location: 'Remote, India', isRemote: true,
        salaryRange: { min: 400000, max: 700000 }, vacancy: 2,
        requiredSkills: ['SEO', 'Keyword Research', 'Ahrefs', 'Google Search Console', 'Content Writing'],
        description: 'Drive organic growth for our client portfolio through technical SEO, content optimisation, and link building strategies.',
        responsibilities: ['Conduct keyword research', 'Optimise on-page content', 'Build quality backlinks', 'Monitor rankings and traffic'],
        requirements: ['Knowledge of SEO fundamentals', 'Familiarity with SEO tools', 'Good content writing skills', 'Analytical mindset'],
    },
    {
        title: 'Content Strategist', jobType: 'Contract', workMode: 'Remote',
        experienceLevel: 'Mid', location: 'Remote, India', isRemote: true,
        salaryRange: { min: 700000, max: 1200000 }, vacancy: 1,
        requiredSkills: ['Content Strategy', 'Copywriting', 'Brand Voice', 'Editorial Planning', 'Analytics'],
        description: '6-month contract to develop and execute a comprehensive content strategy for a major brand relaunch.',
        responsibilities: ['Develop content roadmap', 'Write and edit content', 'Manage content calendar', 'Track content performance'],
        requirements: ['3+ years of content strategy experience', 'Excellent writing skills', 'Experience with brand storytelling', 'Data-driven approach to content'],
    },
    // CloudBase Inc
    {
        title: 'Cloud Solutions Architect', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Senior', location: 'Chennai, India',
        salaryRange: { min: 2400000, max: 3600000 }, vacancy: 1,
        requiredSkills: ['AWS', 'GCP', 'Azure', 'Terraform', 'Kubernetes', 'Architecture'],
        description: 'Design cloud architectures for enterprise clients migrating mission-critical systems to the cloud. Lead technical pre-sales and delivery.',
        responsibilities: ['Design cloud architectures', 'Lead client technical discussions', 'Create migration roadmaps', 'Govern cloud best practices'],
        requirements: ['7+ years of cloud experience', 'AWS Solutions Architect certification', 'Experience with multi-cloud environments', 'Strong communication skills'],
    },
    {
        title: 'Site Reliability Engineer', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Mid', location: 'Chennai, India',
        salaryRange: { min: 1400000, max: 2200000 }, vacancy: 2,
        requiredSkills: ['Linux', 'Python', 'Prometheus', 'Grafana', 'Kubernetes', 'Go'],
        description: 'Ensure the reliability, scalability and performance of our cloud platform serving hundreds of enterprise customers.',
        responsibilities: ['Maintain SLOs and SLAs', 'Build monitoring and alerting', 'Automate operational tasks', 'Conduct blameless post-mortems'],
        requirements: ['3+ years of SRE/operations experience', 'Strong Linux and scripting skills', 'Experience with observability tools', 'Understanding of distributed systems'],
    },
    // EduPath Learning
    {
        title: 'Frontend Developer (React)', jobType: 'Fulltime', workMode: 'Remote',
        experienceLevel: 'Mid', location: 'Remote, India', isRemote: true,
        salaryRange: { min: 1000000, max: 1700000 }, vacancy: 3,
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'Jest'],
        description: 'Build engaging learning experiences for our platform\'s 1M+ learners. Work on interactive video players, quizzes, and live class features.',
        responsibilities: ['Build new features and improvements', 'Write clean, tested code', 'Optimise for performance and accessibility', 'Collaborate with designers'],
        requirements: ['3+ years of React experience', 'Strong TypeScript skills', 'Experience with state management', 'Eye for pixel-perfect UIs'],
    },
    {
        title: 'Instructional Designer', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Mid', location: 'Delhi, India',
        salaryRange: { min: 700000, max: 1100000 }, vacancy: 2,
        requiredSkills: ['Curriculum Design', 'ADDIE Model', 'Articulate Storyline', 'Video Production', 'Learning Analytics'],
        description: 'Design effective online learning experiences for our professional upskilling programs in tech and business.',
        responsibilities: ['Design curriculum and learning paths', 'Create interactive course content', 'Work with subject matter experts', 'Analyse learner outcomes'],
        requirements: ['3+ years in instructional design', 'Experience with e-learning tools', 'Understanding of adult learning principles', 'Strong communication and project management'],
    },
    {
        title: 'Android Developer', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Mid', location: 'Delhi, India',
        salaryRange: { min: 1100000, max: 1800000 }, vacancy: 1,
        requiredSkills: ['Kotlin', 'Android SDK', 'Jetpack Compose', 'MVVM', 'Retrofit'],
        description: 'Build our Android app used by 300K+ students daily. Deliver smooth, performant experiences for learners across diverse devices.',
        responsibilities: ['Develop new Android features', 'Maintain and optimise existing codebase', 'Conduct code reviews', 'Integrate with backend APIs'],
        requirements: ['3+ years of Android development', 'Strong Kotlin skills', 'Experience with Jetpack libraries', 'Knowledge of Android performance optimisation'],
    },
    // HealthBridge Tech
    {
        title: 'iOS Developer', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Senior', location: 'Noida, India',
        salaryRange: { min: 1600000, max: 2500000 }, vacancy: 1,
        requiredSkills: ['Swift', 'SwiftUI', 'HealthKit', 'Core ML', 'Xcode'],
        description: 'Build life-changing health monitoring features for our iOS app used by patients and healthcare providers across India.',
        responsibilities: ['Design and develop iOS features', 'Integrate with medical device SDKs', 'Ensure HIPAA compliance', 'Collaborate with backend and ML teams'],
        requirements: ['5+ years of iOS development', 'Proficiency in Swift and SwiftUI', 'Experience with HealthKit', 'Understanding of healthcare data privacy'],
    },
    {
        title: 'Healthcare Data Scientist', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Senior', location: 'Noida, India',
        salaryRange: { min: 2000000, max: 3000000 }, vacancy: 1,
        requiredSkills: ['Python', 'R', 'Clinical NLP', 'Healthcare Informatics', 'Machine Learning'],
        description: 'Apply machine learning to healthcare data to power predictive analytics, clinical decision support, and personalised care pathways.',
        responsibilities: ['Build predictive health models', 'Analyse clinical datasets', 'Collaborate with medical teams', 'Publish research findings'],
        requirements: ['Masters/PhD in Data Science or Healthcare', '5+ years of healthcare data experience', 'Knowledge of clinical terminology', 'Experience with EHR data'],
    },
    {
        title: 'Business Analyst', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Fresher', location: 'Noida, India',
        salaryRange: { min: 500000, max: 800000 }, vacancy: 3,
        requiredSkills: ['Requirements Gathering', 'SQL', 'JIRA', 'Process Mapping', 'Excel'],
        description: 'Bridge the gap between business stakeholders and technical teams. Define product requirements and drive project delivery.',
        responsibilities: ['Gather and document requirements', 'Create process flow diagrams', 'Facilitate stakeholder meetings', 'Track project milestones'],
        requirements: ['0-2 years of experience', 'Strong analytical and communication skills', 'Basic SQL knowledge', 'Proficiency in MS Office'],
    },
    // RetailEdge Systems
    {
        title: 'Fullstack Engineer (MEAN)', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Mid', location: 'Gurgaon, India',
        salaryRange: { min: 1200000, max: 2000000 }, vacancy: 2,
        requiredSkills: ['MongoDB', 'Express.js', 'Angular', 'Node.js', 'Redis'],
        description: 'Build the next generation of retail management tools used by 5000+ store managers across India.',
        responsibilities: ['Develop web application features', 'Design RESTful APIs', 'Optimise application performance', 'Write unit and integration tests'],
        requirements: ['3+ years of full-stack development', 'Experience with the MEAN stack', 'Knowledge of caching strategies', 'Strong problem-solving skills'],
    },
    {
        title: 'QA Automation Engineer', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Mid', location: 'Gurgaon, India',
        salaryRange: { min: 800000, max: 1400000 }, vacancy: 1,
        requiredSkills: ['Selenium', 'Cypress', 'API Testing', 'Jest', 'Python'],
        description: 'Build and maintain the automated test suite for our retail platform, ensuring quality across web and mobile.',
        responsibilities: ['Design test plans and cases', 'Develop automated test scripts', 'Integrate tests in CI/CD', 'Report and track defects'],
        requirements: ['3+ years of QA automation experience', 'Strong Selenium/Cypress skills', 'Experience with API testing tools', 'Knowledge of CI/CD pipelines'],
    },
    {
        title: 'Product Manager', jobType: 'Fulltime', workMode: 'Hybrid',
        experienceLevel: 'Senior', location: 'Gurgaon, India',
        salaryRange: { min: 2200000, max: 3500000 }, vacancy: 1,
        requiredSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'Stakeholder Management', 'OKRs'],
        description: 'Own the product roadmap for our inventory management module. Drive growth from 500 to 5000 enterprise customers over the next 2 years.',
        responsibilities: ['Define product vision and strategy', 'Prioritise feature backlog', 'Work with engineering and design', 'Define and track KPIs'],
        requirements: ['6+ years of product management', 'Track record of successful product launches', 'Deep analytical skills', 'Strong leadership capabilities'],
    },
    {
        title: 'Cybersecurity Analyst', jobType: 'Fulltime', workMode: 'Onsite',
        experienceLevel: 'Mid', location: 'Gurgaon, India',
        salaryRange: { min: 1300000, max: 2100000 }, vacancy: 1,
        requiredSkills: ['SIEM', 'Penetration Testing', 'Network Security', 'ISO 27001', 'OWASP'],
        description: 'Protect our retail platform and customer data from cyber threats. Lead security assessment, incident response, and compliance.',
        responsibilities: ['Monitor security events', 'Conduct vulnerability assessments', 'Manage security incidents', 'Maintain compliance frameworks'],
        requirements: ['4+ years in cybersecurity', 'CISSP or CEH certification preferred', 'Hands-on pen-testing experience', 'Knowledge of retail compliance requirements'],
    },
    {
        title: 'Technical Writer', jobType: 'Freelance', workMode: 'Remote',
        experienceLevel: 'Fresher', location: 'Remote, India', isRemote: true,
        salaryRange: { min: 250000, max: 450000 }, vacancy: 2,
        requiredSkills: ['Technical Writing', 'API Documentation', 'Markdown', 'Git', 'Swagger'],
        description: 'Create clear, accurate API documentation and developer guides for our eCommerce integration platform.',
        responsibilities: ['Write API reference documentation', 'Create developer quickstart guides', 'Maintain documentation site', 'Gather feedback from developers'],
        requirements: ['Strong English writing skills', 'Basic understanding of REST APIs', 'Ability to explain technical concepts simply', 'Attention to detail'],
    },
];

// ── Main ───────────────────────────────────────────────────────────────────────
async function seed() {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to', MONGO_URI);

    const Company = mongoose.model('Company', companySchema);
    const User = mongoose.model('User', userSchema);
    const Job = mongoose.model('Job', jobSchema);

    // Get or create a demo user for seeding (company role)
    let seedUser = await User.findOne({ email: 'seed@careerconnect.demo' });
    if (!seedUser) {
        seedUser = await User.create({
            name: 'Seed Bot', email: 'seed@careerconnect.demo',
            password: 'hashed', role: 'company'
        });
        console.log('👤 Created seed user:', seedUser._id);
    }

    // Create companies & track their IDs
    const companyDocs = [];
    for (const c of COMPANIES) {
        let co = await Company.findOne({ name: c.name });
        if (!co) {
            co = await Company.create({ ...c, createdBy: seedUser._id });
            console.log(`🏢 Created company: ${c.name}`);
        } else {
            console.log(`🏢 Found existing company: ${c.name}`);
        }
        companyDocs.push(co);
    }

    // Delete existing seeded jobs to avoid duplicates
    await Job.deleteMany({ postedBy: seedUser._id });
    console.log('🗑️  Cleared previous seeded jobs');

    // Company name → doc lookup
    const companyMap = {};
    companyDocs.forEach(c => { companyMap[c.name] = c; });

    const companyOrder = [
        'TechNova Solutions', 'TechNova Solutions', 'TechNova Solutions',
        'DesignHub Studio', 'DesignHub Studio', 'DesignHub Studio',
        'FinCore Analytics', 'FinCore Analytics', 'FinCore Analytics',
        'GreenMark Corp', 'GreenMark Corp', 'GreenMark Corp',
        'CloudBase Inc', 'CloudBase Inc',
        'EduPath Learning', 'EduPath Learning', 'EduPath Learning',
        'HealthBridge Tech', 'HealthBridge Tech', 'HealthBridge Tech',
        'RetailEdge Systems', 'RetailEdge Systems', 'RetailEdge Systems', 'RetailEdge Systems', 'RetailEdge Systems',
    ];

    const jobs = [];
    for (let i = 0; i < JOB_TEMPLATES.length; i++) {
        const template = JOB_TEMPLATES[i];
        const co = companyMap[companyOrder[i]];
        const daysAgo = Math.floor(Math.random() * 20);
        const createdAt = new Date(Date.now() - daysAgo * 86400000);

        jobs.push({
            ...template,
            company: co._id,
            postedBy: seedUser._id,
            deadline: new Date(Date.now() + (30 + Math.floor(Math.random() * 60)) * 86400000),
            createdAt,
        });
    }

    const inserted = await Job.insertMany(jobs);
    console.log(`\n✅ Seeded ${inserted.length} job listings successfully!`);
    console.log('📋 Jobs seeded:');
    inserted.forEach((j, i) => console.log(`  ${i + 1}. ${j.title} (${companyOrder[i]})`));

    await mongoose.disconnect();
    console.log('\n🎉 Done! Your job board is ready.');
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
