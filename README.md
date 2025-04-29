
# CyberSift

CyberSift is an intelligent cybersecurity platform built to help users upload, analyze, and manage digital evidence related to cyber attacks.  
It simplifies incident reporting, leverages machine learning on the CICIDS dataset for attack detection, and keeps users updated with real-time cyber threat news.

Built with passion and precision by **Team EpicElectrons ⚡**.

---

## 🚀 Features

- **Upload Evidence**: Users can submit data related to cyber incidents easily.
- **Smart IP Fetcher**: If users don't know their IP address, they can retrieve it with one click.
- **Comprehensive Case Form**: Collects vital information like attack date, description, source IP, affected system, response hours, IOCS, attack type, and more.
- **Optional Investigator Login**: Investigators can log in and contribute to active cases.
- **Analytics Dashboard**: View how many cases are registered vs solved, straight from the MySQL database.
- **Dynamic Threat News Feed**: Stay informed with real-time updates about ongoing cyber threats.
- **AI Attack Detection**: The backend AI model uses the CICIDS dataset to predict if an attack happened and identifies the attack type.
- **Detailed Investigation Reports**: After analysis, the system generates findings and conclusions in an understandable way.
- **Explainable AI**: Every AI prediction comes with a clear explanation — no black boxes here.

---

## 📁 Project Structure

```bash
CYBERSIFT
│
├── .bun/                   # Bun runtime files
├── .next/                   # Next.js build files
├── node_modules/            # Project dependencies
│
├── postgres/migrations/     # SQL migration files (older version, MySQL now used)
│    └── 0000_large_nuke.sql
│
├── public/                  # Public assets (favicon, icons, manifest)
│
├── src/
│   ├── app/                 # Main application logic
│   ├── components/          # Reusable UI components
│   ├── db/                  # Database connections and schema
│   │   ├── index.ts
│   │   ├── init-mysql.ts     # MySQL connection initialization
│   │   ├── mysql.ts          # MySQL DB configuration
│   │   ├── schema-types.ts
│   │   ├── schema.ts
│   │   └── supabase.ts
│   ├── lib/                 # Helper libraries
│   ├── scripts/             # Utility scripts
│   ├── styles/              # Styling (TailwindCSS / PostCSS)
│   └── types/               # TypeScript definitions
│
├── .env                     # Environment variables
├── .eslintrc.cjs             # ESLint configuration
├── .gitignore                # Git ignore rules
├── components.json           # Component library config
├── Dockerfile                # Docker setup
├── drizzle.config.ts         # Drizzle ORM config
├── next-env.d.ts             # Next.js TypeScript environment
├── next.config.js            # Next.js project config
├── package.json              # Project dependencies
├── postcss.config.js         # PostCSS config
├── prettier.config.js        # Prettier formatting config
├── README.md                 # (You are here!)
├── tailwind.config.ts        # TailwindCSS config
├── tsconfig.json             # TypeScript config
└── tsconfig.tsbuildinfo      # TypeScript build info
```

---

## 🛠️ Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/your-username/cybersift.git
```

2. **Install dependencies**

```bash
bun install
# or
npm install
# or
yarn install
```

3. **Run the development server**

```bash
bun dev
# or
npm run dev
# or
yarn dev
```

4. **Set up environment variables**

Create a `.env` file and add your MySQL database connection strings, API keys, etc.

---

## 🧠 Tech Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: Node.js (Bun runtime), Supabase, **MySQL**
- **Database ORM**: Drizzle ORM
- **Authentication**: Investigator login (optional)
- **AI Attack Detection**: Machine learning trained on **CICIDS dataset**
- **Containerization**: Docker

---

## 📈 Future Enhancements (Planned)

- **IP Auto-fetch Button**: Easy IP detection for users.
- **Live Cyber Threat News Feed**: Keep users informed dynamically.
- **Investigator Dashboard**: Separate portal for investigators to manage cases.
- **Advanced Attack Type Prediction**: Further enhance classification using deeper models.
- **Explainable AI**: Keep findings transparent and easily understandable.

---

## 🤝 Contributing

Pull requests are warmly welcome!  
If you have ideas for new features or improvements, feel free to open an issue and start a conversation.

Let's make cybersecurity smarter together!

---

## 🧡 Acknowledgements

Built with dedication by **Team EpicElectrons ⚡**  
Passionate about cybersecurity, innovation, and making the digital world safer.

--
