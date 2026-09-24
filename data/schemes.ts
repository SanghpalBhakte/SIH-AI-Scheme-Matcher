import type { Scheme } from '@/lib/matching/types'

// Verified, real Government of India entrepreneurship schemes.
// Every entry has a real officialUrl and isDemo: false — per product
// rule, no invented "fake government schemes" are included here.
// Eligibility fields are a simplified model of each scheme's public
// guidelines for prototype purposes — always verify specifics on the
// official page before relying on them.

// Shared "Common Loan Application Form" checklist for the Kishore and
// Tarun tiers of Pradhan Mantri MUDRA Yojana (mudra-tarun, pmmy-kishore
// below) — both tiers use the same official form. mudra.org.in itself
// couldn't be fetched directly this session (persistent robots.txt/
// timeout errors from every fetch tool available), so this was verified
// via three independent public-sector bank websites (Bank of
// Maharashtra, UCO Bank, Canara Bank) hosting byte-identical copies of
// MUDRA's own form — not via a private/aggregator source. The
// "applicant should not be a defaulter" line on the original form is an
// eligibility condition, not a document, so it's omitted here.
const MUDRA_KISHORE_TARUN_DOCUMENTS = [
  'Proof of identity — self-certified copy of Voter ID, Driving Licence, PAN card, Aadhaar card, or Passport',
  'Proof of residence — recent telephone/electricity bill, property tax receipt (not older than 2 months), Voter ID, Aadhaar card, or Passport of the proprietor/partners/directors',
  'Proof of SC/ST/OBC/minority status, if applicable',
  'Proof of identity/address of the business enterprise — copies of relevant licences, registration certificates, or other documents evidencing ownership',
  'Statement of accounts from the existing banker for the last six months, if any',
  "Last two years' balance sheets with income-tax/sales-tax returns, for loans of ₹2 lakh and above",
  'Projected balance sheet for one year (working capital) or the loan period (term loan), for loans of ₹2 lakh and above',
  'Sales achieved during the current financial year, up to the date of application',
  'Project report for the proposed project, with technical and economic viability details',
  'Memorandum and Articles of Association of the company, or the Partnership Deed',
  'Asset and liability statement of the borrower (including directors/partners), if no third-party guarantee is offered',
  'Photographs (two copies) of the proprietor/partners/directors',
]

export const schemes: Scheme[] = [
  {
    id: 'stand-up-india',
    name: 'Stand-Up India Scheme',
    isDemo: false,
    ministry: 'Department of Financial Services, Ministry of Finance',
    // Official rule: "SC/ST and/or woman entrepreneurs, above 18 years"
    // (standupmitra.in/Home/SUISchemes, re-checked 2026-09-24). Women
    // qualify on gender alone, so they go in additionalEligibleGenders —
    // 'Woman' used to sit in `categories`, where it could never match
    // (it's compared to profile.category), wrongly hard-failing every
    // General/OBC woman.
    categories: ['SC', 'ST'],
    additionalEligibleGenders: ['Woman'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: true,
    maxIncomeLakh: null,
    benefit: 'Bank loan of ₹10 lakh – ₹1 crore',
    summary:
      'Facilitates bank loans for setting up a new greenfield enterprise in manufacturing, services, trading or agri-allied sectors.',
    officialUrl: 'https://www.standupmitra.in/',
    // requiredDocuments intentionally left undefined, but NOT because no
    // checklist exists (re-checked 2026-09-05, correcting the prior note
    // below) — standupmitra.in's own Downloads page does publish a
    // scheme-wide "Schemes Document & Check list" (in 10 languages).
    // Its contents couldn't be read here (served as a bot-protected
    // .docx; every fetch tool available was blocked), so rather than
    // guess at what it says, officialChecklistUrl below links straight
    // to the real file. Banks may still request case-by-case additions
    // per the portal's own "Important Steps" page.
    officialChecklistUrl:
      'https://www.standupmitra.in/Default/DownloadFile/Stand-%20Up%20India%20loan%20Application%20Document%20CHECK%20LIST-English.docx',
    applicationSteps: [
      'Visit the Stand-Up India portal (standupmitra.in) in person, at a bank branch, or with help from a Common Service Centre or Lead District Manager.',
      "Answer the portal's onboarding questions about your category, business idea, location, and prior experience.",
      "The portal classifies you as a 'Ready Borrower' or a 'Trainee Borrower' based on your answers.",
      'Ready Borrowers proceed directly to loan application at their chosen bank; Trainee Borrowers first get handholding support through a Stand Up Connect Centre.',
      'Once ready, the portal generates a formal loan application and shares your details with the concerned bank.',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://samarth.powermin.gov.in/content/policies/5f0f87c0-6620-4fae-b440-d11d67d0b2a0.pdf',
  },
  {
    id: 'pmegp',
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    isDemo: false,
    ministry: 'Ministry of Micro, Small and Medium Enterprises (via KVIC)',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Manufacturing', 'Services', 'Trading'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: true,
    maxIncomeLakh: null,
    benefit: 'Margin money subsidy of 15–35% on project cost (up to ₹50 lakh)',
    summary:
      'Credit-linked subsidy for setting up new micro-enterprises, generating self-employment for first-time entrepreneurs.',
    // The bare /pmegpeportal/ directory doesn't reliably serve an
    // index on this older JSP app — link straight to its home page
    // instead. Verified 2026-08-28.
    officialUrl: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    requiredDocuments: [
      'Aadhaar card (mandatory) — PAN card accepted only where Aadhaar has not yet been issued (e.g. NER, J&K)',
      'Caste certificate, if applicable',
      'Special category certificate, wherever required',
      'Rural area certificate, if applicable',
      'Project report',
      'Education / EDP / skill development training certificate, if applicable',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://www.kviconline.gov.in/pmegpeportal/dashboard/notification/PMEGP_Guidelines_Certified_2022_3.pdf',
  },
  {
    id: 'mudra-tarun',
    name: 'Pradhan Mantri MUDRA Yojana (Tarun)',
    isDemo: false,
    ministry: 'Ministry of Finance (MUDRA)',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Collateral-free loan up to ₹10 lakh',
    summary:
      'Provides loans to existing micro and small enterprises looking to expand operations, no collateral required.',
    officialUrl: 'https://www.mudra.org.in/',
    // Re-checked 2026-09-05, correcting the prior "no list" note below:
    // Tarun uses the same official "Common Loan Application Form"
    // checklist as Kishore — see MUDRA_KISHORE_TARUN_DOCUMENTS above for
    // the verification method. applicationSteps still intentionally left
    // undefined: no source found states a step-by-step process beyond
    // "apply via udyamimitra.in or your bank."
    requiredDocuments: MUDRA_KISHORE_TARUN_DOCUMENTS,
    lastVerified: '2026-09-05',
    sourceUrl: 'https://www.mudra.org.in/Default/DownloadFile/Common_loan_Application_form.pdf',
  },
  {
    id: 'mahila-udyam-nidhi',
    name: 'Mahila Udyam Nidhi Scheme',
    isDemo: false,
    ministry: 'Department of Financial Services, Ministry of Finance (via SIDBI)',
    categories: ['Any'],
    genders: ['Woman'],
    states: ['All'],
    sectors: ['Manufacturing', 'Services'],
    stages: ['Idea', 'Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Soft loan up to ₹25 lakh via SIDBI/PNB',
    summary: 'Low-interest financing for women setting up or expanding small-scale industrial units.',
    officialUrl: 'https://sidbi.in/',
    // requiredDocuments intentionally left undefined: re-checked
    // 2026-09-05 — this scheme no longer appears anywhere on SIDBI's
    // current official site (including its own "Government Programmes"
    // listing). A 2026-era PIB Lok Sabha reply confirms SIDBI
    // historically ran it, but multiple independent signals suggest it
    // has since been discontinued/phased out. FLAGGED for a maintainer
    // to confirm whether this scheme should still be listed at all —
    // not something to resolve unilaterally as part of a documents-list
    // pass.
  },
  {
    id: 'tread',
    name: 'TREAD Scheme for Women',
    isDemo: false,
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    categories: ['Any'],
    genders: ['Woman'],
    states: ['All'],
    sectors: ['Trading', 'Services', 'Handicrafts'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: true,
    maxIncomeLakh: null,
    benefit: 'Loan (up to 30% of project cost) + grant for training/counselling',
    summary:
      'Trade Related Entrepreneurship Assistance and Development for women in non-farm activities, bundled with training support.',
    officialUrl: 'https://msme.gov.in/',
    // Re-checked 2026-09-05, correcting the prior "no itemized list" note
    // below: DC-MSME's own TREAD-for-Women online application user
    // manual (for the sponsoring NGO) names the exact file uploads on its
    // "Upload Documents" tab, referencing the scheme's own lettered
    // annexures (there's no "Annexure C" in the source — that label is
    // skipped there, not omitted here).
    requiredDocuments: [
      "Chief Functionary's photograph",
      "Key Functionaries' photograph(s)",
      'Registration Certificate of the NGO/Organisation (Annexure A)',
      'Main objectives as given in the bye-laws (Annexure B)',
      'Audited balance sheets for the last 3 years (Annexure D)',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://www.dcmsme.gov.in/schemes/TREAD_UserManual_for_NGO.pdf',
  },
  {
    id: 'vcf-sc',
    name: 'Venture Capital Fund for Scheduled Castes',
    isDemo: false,
    ministry: 'Ministry of Social Justice and Empowerment (via IFCI)',
    categories: ['SC'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Manufacturing', 'Services', 'Technology'],
    stages: ['Growth', 'Established'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Equity / venture capital funding',
    summary: 'IFCI-managed fund providing growth capital to SC entrepreneurs scaling an established business.',
    // The IFCI Ltd. content page previously linked here no longer
    // resolves (DNS lookup fails). VCF-SC has its own dedicated,
    // currently-live portal — verified 2026-08-28.
    officialUrl: 'https://www.vcfsc.in/',
    // Scoped, conditional list — not a full generic checklist — exactly
    // as stated on the official eligibility page. Checked 2026-09-05.
    requiredDocuments: [
      'Documentary proof of SC category, submitted by the entrepreneur',
      'For the technology-incubation category: proof of support from an incubation centre/corporate, or patent/copyright documents in the SC entrepreneur’s name',
      'Sanction letter from the concerned Government of India department, where the project is sanctioned by one',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://www.vcfsc.in/eligibility.html',
  },
  {
    id: 'nstfdc-term-loan',
    name: 'National ST Finance & Development Corporation Term Loan',
    isDemo: false,
    ministry: 'Ministry of Tribal Affairs',
    categories: ['ST'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Idea', 'Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: 3,
    benefit: 'Concessional term loan up to ₹5 lakh (higher for larger units)',
    summary: 'Low-interest term loans for ST entrepreneurs below the income cut-off to start or grow a business.',
    // nstfdc.nic.in no longer resolves — NSTFDC has moved under the
    // Ministry of Tribal Affairs' own domain. Verified 2026-08-28.
    officialUrl: 'https://nstfdc.tribal.gov.in/',
    // requiredDocuments / applicationSteps intentionally left undefined:
    // re-checked nstfdc.tribal.gov.in on 2026-09-03, including its own
    // "How to Apply" and Term Loan pages — all three only direct
    // applicants to approach their District / State Channelising Agency
    // office for guidance and to file loan applications there; none
    // states a document list or a step-by-step process to cite.
  },
  {
    id: 'nskfdc',
    name: 'NSKFDC Micro-Financing Scheme',
    isDemo: false,
    ministry: 'Ministry of Social Justice and Empowerment',
    categories: ['SC'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Services', 'Trading'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: 2.5,
    benefit: 'Micro-loan up to ₹1.5 lakh at subsidised interest',
    summary:
      'Targeted micro-credit for low-income Safai Karamchari / SC community members to start small ventures.',
    officialUrl: 'https://nskfdc.nic.in/',
    // requiredDocuments intentionally left undefined: checked 2026-09-05
    // — the official "How to Apply" and FAQ pages describe only the
    // institutional loan-routing process (via a State Channelising
    // Agency/bank to NSKFDC's Project Appraisal Committee) and an
    // occupation-based eligibility certificate; NSKFDC's own Preliminary
    // Loan Application Form asks only for basic applicant details and
    // does not itemize supporting documents to attach.
  },
  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi',
    isDemo: false,
    ministry: 'Ministry of Housing and Urban Affairs',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Trading', 'Services'],
    stages: ['Idea'],
    firstTimeOnly: true,
    maxIncomeLakh: 2,
    benefit: 'Collateral-free working capital loan of ₹10,000 – ₹50,000',
    summary:
      'Small, collateral-free loans for street vendors and micro-traders starting out with very limited capital.',
    officialUrl: 'https://pmsvanidhi.mohua.gov.in/',
    requiredDocuments: ['Certificate of Vending (CoV) or Letter of Recommendation (LoR) issued by your Urban Local Body'],
    applicationSteps: [
      'Apply through the PM SVANidhi portal, the mobile app, or with help from your Urban Local Body (ULB).',
      'Submit your application along with your Certificate of Vending (CoV) or Letter of Recommendation (LoR).',
      'Your application goes through verification and completion of formalities.',
      'Once approved (about 23 days on average), the loan is processed and disbursed.',
    ],
    lastVerified: '2026-08-27',
    sourceUrl: 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/may/doc2026530879701.pdf',
  },
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma Scheme',
    isDemo: false,
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    categories: ['OBC', 'General', 'SC', 'ST'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Handicrafts', 'Manufacturing'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: true,
    maxIncomeLakh: null,
    benefit: 'Collateral-free loan up to ₹3 lakh + toolkit incentive of ₹15,000',
    summary:
      'Supports traditional artisans and craftspeople with low-interest credit and a toolkit incentive to formalise their trade.',
    officialUrl: 'https://pmvishwakarma.gov.in/',
    // Re-checked 2026-09-05, correcting the prior note below: the PIB
    // press release indeed names nothing further, but the scheme's own
    // official Guidelines PDF (§5.1, "Application for enrolment") does.
    requiredDocuments: [
      'Ration Card — if you have none, Aadhaar numbers of every family member instead',
      "Bank account (a Common Service Centre can help you open one if you don't have one)",
    ],
    applicationSteps: [
      'Enrol at a Common Service Centre (CSC) using Aadhaar-based biometric authentication on the PM Vishwakarma portal.',
      'Your application is verified at the Gram Panchayat / Urban Local Body level.',
      'The District Implementation Committee reviews and recommends your application.',
      "A Screening Committee gives final approval before you're issued a PM Vishwakarma certificate and ID card.",
    ],
    // sourceUrl covers requiredDocuments/lastVerified; applicationSteps
    // still trace to the PIB release cited here previously — both
    // describe the same enrolment process, just at different detail
    // levels.
    lastVerified: '2026-09-05',
    sourceUrl: 'https://pmvishwakarma.gov.in/cdn/MiscFiles/eng_v30.0_PM_Vishwakarma_Guidelines_final.pdf',
  },
  {
    id: 'seed-fund',
    name: 'Startup India Seed Fund Scheme',
    isDemo: false,
    ministry: 'Department for Promotion of Industry and Internal Trade, Ministry of Commerce and Industry',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Technology', 'Services', 'Manufacturing'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Grant / debt funding up to ₹50 lakh',
    summary:
      'Provides early-stage financial assistance to DPIIT-recognised startups for proof of concept, prototyping and market entry.',
    officialUrl: 'https://seedfund.startupindia.gov.in/',
    // requiredDocuments intentionally left undefined: the official
    // guidelines specify pitch/application content (team profile,
    // problem statement, business model, etc.) rather than a list of
    // documents to attach — listing that content as "documents" would
    // misrepresent what the source actually says.
    applicationSteps: [
      'Apply online via the Startup India portal, naming up to three preferred incubators as disbursing partners.',
      'Your application is shared with your selected incubators for an eligibility review.',
      'Incubators decide whether to shortlist you for a pitch presentation.',
      'The Incubator Seed Management Committee (ISMC) evaluates shortlisted applications, typically within 45 days.',
      'If shortlisted, present your proposal to the ISMC.',
      "You're notified of acceptance or rejection by email; rejected applicants may reapply.",
      'If accepted, sign the funding agreement with your selected incubator.',
    ],
    lastVerified: '2026-08-27',
    sourceUrl:
      'https://www.startupindia.gov.in/content/dam/invest-india/Templates/public/Guidelines%20for%20Startup%20India%20Seed%20Fund%20Scheme.pdf',
  },
  {
    id: 'nrlm-shg',
    name: 'Deendayal Antyodaya Yojana – NRLM',
    isDemo: false,
    ministry: 'Ministry of Rural Development',
    categories: ['Any'],
    genders: ['Woman'],
    states: ['All'],
    sectors: ['Agriculture', 'Food Processing', 'Handicrafts'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: 3,
    benefit: 'Low-interest SHG loans + skill training',
    summary:
      'Organises rural low-income women into Self-Help Groups and provides affordable credit plus livelihood training.',
    officialUrl: 'https://aajeevika.gov.in/',
    // Scoped to the SHG bank credit-linkage step (this scheme's own
    // "loans" benefit), not general SHG formation — from the official
    // DAY-NRLM Handbook on SHG. Checked 2026-09-05.
    requiredDocuments: [
      'Resolution authorising the SHG to apply for a bank loan',
      'Loan application form, signed by office bearers',
      'Inter-se agreement',
      'Loan agreement form',
      "Photographs (passport-size, 3 copies each) of the SHG's office bearers, with the group's seal",
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://daynrlmbl.aajeevika.gov.in/Circulars/Handbook%20on%20SHG.pdf',
  },

  // --- Added in a later batch: broadens coverage past the original scheme set ---
  // (income guarantees, disability, backward-classes, and sector-specific
  // schemes) — every entry below is a real, currently-operating Government
  // of India programme with its own official domain, verified 2026-08-28.
  {
    id: 'pmmy-shishu',
    name: 'Pradhan Mantri MUDRA Yojana (Shishu)',
    isDemo: false,
    ministry: 'Ministry of Finance (MUDRA)',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Idea'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Collateral-free loan up to ₹50,000',
    summary: "The starter tranche of PMMY — small working-capital loans for a business that's just getting off the ground.",
    officialUrl: 'https://www.mudra.org.in/',
    // Shishu has its own, shorter checklist, distinct from the Kishore/
    // Tarun "Common Loan Application Form" (see MUDRA_KISHORE_TARUN_DOCUMENTS
    // above). Same fetch limitation as noted there — verified via
    // independent mirrors reproducing MUDRA's own Shishu checklist file
    // rather than a direct fetch of mudra.org.in. Checked 2026-09-05.
    requiredDocuments: [
      'Proof of identity — self-certified copy of Voter ID, Driving Licence, PAN card, Aadhaar card, Passport, or another government-issued photo ID',
      'Proof of residence — recent telephone/electricity bill, property tax receipt, Voter ID, Aadhaar card, Passport, or a certificate from a government authority/local panchayat/municipality',
      "Applicant's recent photograph (2 copies), not older than 6 months",
      'Proof of SC/ST/OBC/minority status, if applicable',
      'Proof of identity/address of the business enterprise, if available',
      'Statement of account from the existing banker for the last six months, if any',
      'Quotation for machinery/equipment/items to be purchased, if applicable',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://www.mudra.org.in/Default/DownloadFile/Check_list_for_Shishu_application.jpg',
  },
  {
    id: 'pmmy-kishore',
    name: 'Pradhan Mantri MUDRA Yojana (Kishore)',
    isDemo: false,
    ministry: 'Ministry of Finance (MUDRA)',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Collateral-free loan from ₹50,000 up to ₹5 lakh',
    summary: 'The middle PMMY tranche, for a business past its first few months that needs more working capital than Shishu covers.',
    officialUrl: 'https://www.mudra.org.in/',
    // Same "Common Loan Application Form" as Tarun — see
    // MUDRA_KISHORE_TARUN_DOCUMENTS above for the list and verification
    // method. Checked 2026-09-05.
    requiredDocuments: MUDRA_KISHORE_TARUN_DOCUMENTS,
    lastVerified: '2026-09-05',
    sourceUrl: 'https://www.mudra.org.in/Default/DownloadFile/Common_loan_Application_form.pdf',
  },
  {
    id: 'cgtmse',
    name: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
    isDemo: false,
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Early', 'Growth', 'Established'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Collateral-free credit guarantee cover up to ₹5 crore',
    summary:
      'Guarantees bank and NBFC loans to micro and small enterprises, so a lender can extend credit without collateral or a third-party guarantor.',
    officialUrl: 'https://www.cgtmse.in/',
    // Re-checked 2026-09-05, refining the prior note below: CGTMSE's own
    // borrower-facing FAQ does name two identifiers it requires directly.
    requiredDocuments: [
      'Udyam Registration Number — mandatory, entered into the system when the lender submits your guarantee application',
      'Income Tax PAN — mandatory before availing the facility; must be indicated for credit facilities above ₹5 lakh',
    ],
    // Everything beyond these two CGTMSE-mandated identifiers follows the
    // individual lending bank/NBFC's own MSE/KYC requirements, which
    // CGTMSE doesn't standardise or publish — CGTMSE itself states it
    // "does not provide any financial assistance" directly, and its
    // separate "list of documents" page is for banks/NBFCs registering
    // as Member Lending Institutions, not for the borrowing entrepreneur.
    lastVerified: '2026-09-05',
    sourceUrl: 'https://www.cgtmse.in/Home/VS/95',
  },
  {
    id: 'scst-hub',
    name: 'National SC-ST Hub Scheme',
    isDemo: false,
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    categories: ['SC', 'ST'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Idea', 'Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Handholding support, capacity building, and facilitated access to credit and marketing',
    summary:
      'Dedicated centres that support SC/ST entrepreneurs with business handholding, skill development, and easier access to other MSME schemes and government marketplaces.',
    officialUrl: 'https://www.scsthub.in/',
    // requiredDocuments intentionally left undefined: checked 2026-09-05
    // — scsthub.in's general Hub sign-up only asks for name/email/mobile.
    // One of the Hub's several sub-schemes (Bank Loan Processing Fee
    // Reimbursement) does publish its own itemized document list, but
    // that's scoped to that specific reimbursement, not to the Hub's
    // handholding/marketing support described above — applying it here
    // would misrepresent it as a general requirement.
  },
  {
    id: 'nbcfdc-loan',
    name: 'NBCFDC Term Loan Scheme',
    isDemo: false,
    ministry: 'Ministry of Social Justice and Empowerment',
    categories: ['OBC'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Idea', 'Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: 3,
    benefit: 'Concessional term loan, channelled through state agencies',
    summary:
      'Low-interest term loans for OBC entrepreneurs below the income cut-off, disbursed through state channelising agencies rather than directly.',
    officialUrl: 'https://nbcfdc.gov.in/',
    // From NBCFDC's own official FAQ (Q.11, "what documents are required
    // to prove eligibility for the loan"). Checked 2026-09-05.
    requiredDocuments: [
      'Caste certificate for Other Backward Classes, issued by the relevant District Administration authority',
      'Proof of income — an income certificate from the Competent Authority/District Administration, an Antyodaya Anna Yojana (AAY) card, or a Below Poverty Line (BPL) card; alternatively, a self-certified annual family income declaration endorsed by a Gazetted Officer (or, for bank loan applicants, by the Branch Manager)',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://nbcfdc.gov.in/nbcfdc/web/sites/default/files/2024-11/FAQ-NBCFDC.pdf',
  },
  {
    id: 'ndfdc-disability',
    name: 'National Divyangjan Finance & Development Corporation (NDFDC) Loans',
    isDemo: false,
    ministry: 'Department of Empowerment of Persons with Disabilities',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Any'],
    stages: ['Idea', 'Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    // Disability IS a strict eligibility gate (checked 2026-09-24):
    // NDFDC's own self-loan FAQ — "Any Indian Citizen with 40% or more
    // disability", minimum age 18, "no economic criteria"
    // (admin.ndfdcloanaccount.co.in/web-asset/pdf/faqs/FAQs_SelfLoan.pdf).
    // Before this, the record was open to everyone and was recommended
    // at 100% to applicants who never indicated a disability.
    requiredSpecialGroups: ['PwD'],
    benefit: 'Concessional-rate loans for self-employment ventures',
    summary:
      'Formerly the National Handicapped Finance & Development Corporation (NHFDC) — concessional loans and skill-training support for persons with disabilities starting or expanding a self-employment venture.',
    officialUrl: 'https://depwd.gov.in/en/national-handicapped-finance-and-development-corporation/',
    // Re-checked 2026-09-05: ndfdc.nic.in IS reachable now (correcting
    // the prior DNS-failure note below). Its only published checklist is
    // for the Vishesh Microfinance Yojana route — the NGO/NBFC-MFI
    // channel partner's own application (RBI registration, MoA, audited
    // financials, etc.), not a document list for an individual PwD
    // applying directly. Applying that NGO-facing list here would
    // misrepresent what an individual entrepreneur needs, so
    // requiredDocuments is still left unset.
  },
  {
    id: 'aspire',
    name: 'ASPIRE Scheme',
    isDemo: false,
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Manufacturing', 'Agriculture', 'Food Processing'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Incubation support and seed funding through Livelihood Business Incubators',
    summary:
      'A Scheme for Promotion of Innovation, Rural Industries and Entrepreneurship — funds business incubators that support rural and agro-based enterprises from idea to launch.',
    officialUrl: 'https://aspire.msme.gov.in/',
    // requiredDocuments intentionally left undefined: checked 2026-09-05
    // — the official MSME scheme page and PIB releases describe ASPIRE
    // as funding incubator institutions via project proposals, with
    // applications going to the Aspire Scheme Steering Committee; no
    // individual-applicant document checklist is stated anywhere found.
  },
  {
    id: 'pmfme',
    name: 'PM Formalisation of Micro Food Processing Enterprises (PM FME)',
    isDemo: false,
    ministry: 'Ministry of Food Processing Industries',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Food Processing'],
    stages: ['Idea', 'Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Credit-linked subsidy of 35% of project cost, up to ₹10 lakh',
    summary:
      'Helps existing micro food-processing units (and new ones under the One District One Product approach) formalise, upgrade equipment, and access credit.',
    officialUrl: 'https://pmfme.mofpi.gov.in/',
    // Re-checked 2026-09-05, correcting the prior note below: the
    // official portal does publish an itemized "Mandatory Document Check
    // List" under its own Downloads section — it isn't a single flat
    // list since requirements differ by applicant type. Listed here is
    // the New Enterprise/Individual tier; existing enterprises and FPCs/
    // Cooperatives/SHGs additionally need registration, licenses, and
    // governance documents not listed below (see source).
    requiredDocuments: [
      'PAN card of all promoters',
      'Aadhaar card and photograph of all promoters/guarantors',
      'Address proof (utility bill, property tax receipt, or ration card)',
      'Bank statement/passbook for the last 6 months',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://pmfme.mofpi.gov.in/mofpi/api/home/getDownloads/38',
  },
  {
    id: 'pmmsy',
    name: 'Pradhan Mantri Matsya Sampada Yojana (PMMSY)',
    isDemo: false,
    ministry: 'Department of Fisheries',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    // No dedicated "Fisheries" sector exists in this dataset's model
    // (see SECTOR_OPTIONS in lib/matching/types.ts) — mapped to the
    // closest existing option rather than inventing a new one.
    sectors: ['Agriculture'],
    stages: ['Idea', 'Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Capital subsidy on fisheries and aquaculture project cost',
    summary:
      'Supports fish farmers and fisheries-sector entrepreneurs with subsidised capital for ponds, hatcheries, cold chain, and other allied infrastructure.',
    officialUrl: 'https://pmmsy.dof.gov.in/',
    // Re-checked 2026-09-05: still no fixed personal-KYC checklist, but
    // NFDB's own official FAQ does itemize what your DPR/Self-Contained
    // Proposal (submitted to the District Fisheries Office) must
    // include — listed here as that, not as personal documents.
    requiredDocuments: [
      'Documentary evidence of land availability and required statutory clearances/permissions/licenses',
      'Registered lease document, if the land is leased',
      'Financial statements for the last 3 years (for entrepreneurs/autonomous agencies)',
      'Feasibility study (where needed) and a detailed cost estimate per the prescribed methodology',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://nfdb.gov.in/PDF/PMMSY-FAQS.pdf',
  },
  {
    id: 'cgss-startups',
    name: 'Credit Guarantee Scheme for Startups (CGSS)',
    isDemo: false,
    ministry: 'Department for Promotion of Industry and Internal Trade, Ministry of Commerce and Industry',
    categories: ['Any'],
    genders: ['Any'],
    states: ['All'],
    sectors: ['Technology', 'Services', 'Manufacturing'],
    stages: ['Early', 'Growth'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Collateral-free credit guarantee cover up to ₹10 crore',
    summary:
      'Guarantees working-capital and term loans to DPIIT-recognised startups, so a lender can extend credit without collateral.',
    officialUrl: 'https://www.startupindia.gov.in/content/sih/en/credit-guarantee-scheme-for-startups.html',
    // requiredDocuments intentionally left undefined: checked 2026-09-05
    // — CGSS is a credit guarantee, not a direct-apply scheme; official
    // sources (NCGTC, Jan Samarth, PIB) say to apply via the Jan Samarth
    // portal or approach a Member Institution directly, with
    // documentation set by that lender rather than standardised by
    // DPIIT/NCGTC on any page found.
  },

  // --- State-specific schemes ---
  // Every scheme above this point is nationwide ('states: [All]'), which
  // meant the assessment's state field never actually filtered anything.
  // These are real, currently-operating STATE government programmes —
  // each verified against its own official state portal (or, where that
  // portal blocked automated fetches, cross-checked across multiple
  // independent secondary sources reporting the same figures) on
  // 2026-09-02. Benefit figures are stated only where directly
  // confirmed — see each entry's comment for what couldn't be verified.
  {
    id: 'bihar-mmuy',
    name: 'Mukhyamantri Udyami Yojana (MMUY)',
    isDemo: false,
    ministry: 'Industries Department, Government of Bihar',
    categories: ['SC', 'ST', 'OBC', 'General'],
    genders: ['Any'],
    states: ['Bihar'],
    sectors: ['Manufacturing', 'Services'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: true,
    maxIncomeLakh: null,
    // The official portal confirms six separate category-wise resolutions
    // (SC/ST, OBC, Women, Youth, Minority, combined) but doesn't state the
    // loan/subsidy split on its own pages. The ₹10 lakh split below is
    // cross-verified as consistent and reliable across many independent
    // scheme-tracking sources (re-checked 2026-09-02) — still not a direct
    // primary-source figure, but confident enough to state plainly rather
    // than hedge.
    benefit: '₹10 lakh total — ₹5 lakh non-repayable subsidy + ₹5 lakh interest-free loan (84-month repayment)',
    summary:
      "Bihar's flagship self-employment scheme for first-time entrepreneurs, run as separate category-wise tracks for SC/ST, OBC, women, youth, and minority applicants.",
    officialUrl: 'https://udyami.bihar.gov.in/mmuy',
    // See Task 3 (2026-09-03): mirrors the comment above — flagged as a
    // data-confidence caveat, not just an internal note.
    dataConfidenceNote:
      'The ₹5L + ₹5L loan/subsidy split is corroborated across multiple independent scheme-tracking sources, not stated directly on the official Bihar portal itself.',
    // From the official Bihar portal's own FAQ PDF (Q.7). Checked
    // 2026-09-05.
    requiredDocuments: [
      'Matriculation certificate (showing date of birth)',
      'Intermediate or equivalent qualification certificate',
      'Caste certificate',
      'Permanent residence certificate',
      'Disability certificate, if applicable',
      "Applicant's live photograph",
      "Applicant's signature",
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://udyami.bihar.gov.in/pdf/FAQ.pdf',
  },
  {
    id: 'wb-karma-sathi',
    name: 'Karma Sathi Prakalpa',
    isDemo: false,
    ministry: 'Directorate of MSME & Textiles, Government of West Bengal',
    categories: ['Any'],
    genders: ['Any'],
    states: ['West Bengal'],
    sectors: ['Manufacturing', 'Services', 'Trading'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Interest-free loan up to ₹2 lakh',
    summary:
      'Self-employment loan scheme for West Bengal youth (18–45) with at least a Class VIII education, disbursed as a 0%-interest soft loan repayable over 5 years.',
    officialUrl: 'https://karmasathi.wb.gov.in/scheme',
    // From the "Check List" printed on the official application form
    // (West Bengal government's Bangla Sahayata Kendra portal). Checked
    // 2026-09-05.
    requiredDocuments: [
      'Photo identity proof',
      'Residence proof',
      'Age proof',
      'Proof of educational qualification',
      'Caste certificate, if applicable',
      'Detailed project report',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://bsk.wb.gov.in/download/49.pdf',
  },
  {
    id: 'kerala-kudumbashree',
    name: 'Kudumbashree Micro Enterprises',
    isDemo: false,
    ministry: 'Department of Local Self Government, Government of Kerala',
    categories: ['Any'],
    genders: ['Woman'],
    states: ['Kerala'],
    sectors: ['Any'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Interest subsidy, startup/revolving/innovation funds; e.g. PEARL sub-scheme covers up to 75% of project cost or ₹2 lakh, whichever is lower',
    summary:
      "Kerala's state poverty-eradication mission organises women into neighbourhood groups and funds micro-enterprises through interest subsidies and dedicated startup, revolving, technology, and innovation funds.",
    officialUrl: 'https://www.kudumbashree.org/pages/653',
    // requiredDocuments intentionally left undefined: checked 2026-09-05
    // — this page (and related official pages checked) covers roughly 20
    // different Kudumbashree micro-enterprise sub-programmes and funding
    // types with no documents named; Kudumbashree isn't a single scheme
    // with one defined document set, so no honest single list can be
    // cited at this level.
  },
  {
    id: 'karnataka-udyogini',
    name: 'Udyogini Scheme',
    isDemo: false,
    ministry: "Karnataka State Women's Development Corporation",
    // CONSOLIDATED (2026-09-02 audit): this dataset used to also carry a
    // second, older "udyogini" entry for the same real scheme (identical
    // officialUrl below), which wrongly claimed `states: ['All']`
    // (nationwide) — a Karnataka-only scheme was matching applicants
    // everywhere in India. That entry is removed; this Karnataka-scoped
    // one is canonical. Its `categories` also listed OBC in addition to
    // General/SC/ST — not carried over here since this entry's own
    // sourcing (the specific SC/ST vs. general subsidy split below)
    // only confirms General/SC/ST, and OBC wasn't independently
    // re-verified this pass — see the Perplexity handoff brief.
    categories: ['General', 'SC', 'ST'],
    genders: ['Woman'],
    states: ['Karnataka'],
    sectors: ['Any'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    // Consistently reported across multiple sources (the official portal
    // itself blocked automated verification): general/other-category cap
    // ~₹1.5 lakh/yr, SC/ST cap ~₹2 lakh/yr, uncapped for widows/disabled.
    // Modelled here on the general-category cap since the engine only
    // supports one number per scheme.
    maxIncomeLakh: 1.5,
    benefit: 'Collateral-free loan up to ₹3 lakh; subsidy 50% (max ₹1.5 lakh) for SC/ST, 30% (max ₹90,000) for general category',
    summary:
      'Subsidised, collateral-free loans for women aged 18–55 starting a small business across roughly 88 approved trades, with a higher subsidy tier for SC/ST applicants.',
    // requiredDocuments NOT added: re-checked 2026-09-05 with a live
    // browser render of kswdc.karnataka.gov.in/21/udyogini/en (confirmed
    // fully loaded, not a broken shell) — the earlier lead (an
    // "Eligibility criteria and Required Documents" fragment surfaced via
    // a search-index cache) no longer matches what the live page shows:
    // just loan-amount and subsidy-percentage text, no documents section.
    // Treating the cached fragment as stale rather than citing it.
    officialUrl: 'https://kswdc.karnataka.gov.in/21/udyogini/en',
    // See Task 3 (2026-09-03): mirrors the comment above — flagged as a
    // data-confidence caveat, not just an internal note.
    dataConfidenceNote:
      "The official KSWDC portal blocked automated verification; the income caps above are corroborated across multiple secondary sources instead, and OBC eligibility hasn't been independently confirmed.",
  },
  {
    id: 'mp-udyam-kranti',
    name: 'Mukhyamantri Udyam Kranti Yojana (MMUKY)',
    isDemo: false,
    ministry: 'MSME Department, Government of Madhya Pradesh',
    categories: ['General', 'OBC'],
    genders: ['Any'],
    states: ['Madhya Pradesh'],
    sectors: ['Manufacturing', 'Services'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Loan of ₹50,000 – ₹50 lakh (industry) or ₹50,000 – ₹25 lakh (service), with a 3% interest subsidy',
    summary:
      'Loan and interest-subsidy scheme for unemployed youth (18–45, minimum 8th-standard education) setting up a new industry or service business in Madhya Pradesh.',
    officialUrl: 'https://dhar.nic.in/en/scheme/mukhaymantri-udhaym-kranti-yojana/',
    // Stated as run-on prose (not a clean bulleted list) under "How to
    // apply under Scheme" on the official district NIC page — cleaned up
    // into list form here without adding or dropping any item. Checked
    // 2026-09-05.
    requiredDocuments: [
      'Project report',
      'Ration card',
      'Permanent resident certificate',
      'Voter ID',
      'Aadhaar card',
      'PAN card',
      'Bank passbook',
      'Mark list of educational qualification (minimum 8th standard)',
      'Birth certificate',
      'Caste certificate',
      'Land/building ownership document, or rent deed',
      'Quotation (for machinery/equipment)',
      'Passport-size photograph',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://dhar.nic.in/en/scheme/mukhaymantri-udhaym-kranti-yojana/',
  },
  {
    id: 'tn-needs',
    name: 'New Entrepreneur-cum-Enterprise Development Scheme (NEEDS)',
    isDemo: false,
    ministry: 'Tamil Nadu Industrial Investment Corporation (TIIC)',
    categories: ['General', 'SC', 'ST', 'OBC'],
    genders: ['Any'],
    states: ['Tamil Nadu'],
    sectors: ['Manufacturing', 'Services'],
    stages: ['Early'],
    firstTimeOnly: true,
    maxIncomeLakh: null,
    benefit: 'Project cost ₹10–500 lakh; promoter contribution 10% (general) or 5% (special category)',
    summary:
      'Loan scheme for first-generation Tamil Nadu entrepreneurs (HSC-pass, resident 3+ years) starting a new manufacturing or service enterprise, with lower promoter contribution and relaxed age limits for women, SC/ST, and other special categories.',
    officialUrl: 'https://www.tiic.org/need-scheme/',
    // The TIIC page above doesn't itself list documents — this comes
    // from the official NEEDS application form issued by a Tamil Nadu
    // District Industries Centre (a state government office under the
    // Commissionerate of Industries and Commerce). Checked 2026-09-05.
    requiredDocuments: [
      'Proof of age — birth certificate, or Transfer Certificate from school/college',
      'Proof of residence — Ration Card, or Residence Certificate from the Tahsildar',
      'Degree/Diploma/Certificate of course completion',
      'Community certificate',
      'Certificate of Ex-servicemen/differently-abled/transgender status, wherever applicable',
      "Project report with projected sales and cash-flow statement for the next 3 years",
      'Copy of land document, if land is included in the project cost',
      'Estimate of building, obtained from a Chartered Civil Engineer',
      'Quotations for machinery or equipment',
      'Sworn affidavit from a Notary Public, on ₹20 stamp paper',
      'Entrepreneur Memorandum (Part I) acknowledgement from the District Industries Centre',
      'Copy of partnership deed, for a partnership enterprise',
    ],
    lastVerified: '2026-09-05',
    sourceUrl: 'https://www.dicnmkl.in/brochure/NEEDS_APPLICATION.pdf',
  },
  {
    id: 'odisha-mission-shakti',
    name: 'Mission Shakti',
    isDemo: false,
    ministry: 'Directorate of Mission Shakti, Department of Women & Child Development, Government of Odisha',
    categories: ['Any'],
    genders: ['Woman'],
    states: ['Odisha'],
    sectors: ['Any'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    benefit: 'Effectively 0%-interest loans up to ₹3 lakh for Self-Help Groups on prompt repayment, plus skill training and market linkage',
    summary:
      "Odisha's flagship women's Self-Help Group mission (groups of 10–15, members aged 18–65) providing near-zero-interest micro-enterprise loans alongside skill training.",
    officialUrl: 'https://missionshakti.odisha.gov.in/more/msd-FAQs',
    // requiredDocuments intentionally left undefined: checked 2026-09-05
    // — Mission Shakti is a broad department/mission (SHG formation,
    // bank linkage, interest subvention, skilling) rather than a single
    // scheme with one application form; the official FAQ covers
    // eligibility and objectives, not a documents-required list.
  },
  {
    id: 'up-vishwakarma-shram-samman',
    name: 'Vishwakarma Shram Samman Yojana',
    isDemo: false,
    ministry: 'Directorate of Industries, Government of Uttar Pradesh (UP MSME)',
    categories: ['Any'],
    genders: ['Any'],
    states: ['Uttar Pradesh'],
    sectors: ['Handicrafts', 'Services'],
    stages: ['Idea', 'Early'],
    // Not confirmed as first-time-only on any official source below
    // (unlike e.g. stand-up-india/pmegp/tn-needs, where the source
    // explicitly states this) — left false rather than guessing a
    // restriction that could wrongly exclude an eligible artisan.
    firstTimeOnly: false,
    maxIncomeLakh: null,
    // Re-verified directly, 2026-09-02, against all 4 sources below.
    //
    // Training duration: 6 days is used as canonical. Two independent
    // official sources specific to VSSY agree on this — the official
    // notification PDF ("6 days of free training for skill enhancement")
    // and the UP MSME FAQ page ("6-day training with free toolkits").
    // NOTE (residual discrepancy, not silently dropped): the scheme-list
    // page cited as officialUrl below still displays "Free skill
    // development training of up to 10 days" directly under its own
    // Vishwakarma Shram Samman Yojana heading, with no separate ODOP
    // heading present on that page — so this page's own text does not,
    // on direct re-fetch, cleanly attribute 10 days to ODOP the way a
    // clean source-separation would. Separately, ODOP's own official PDF
    // (GovernmentScheme638740903611201250.pdf) independently confirms
    // ODOP's own training duration is 10 days, which is why 10 days is
    // treated as ODOP's figure rather than VSSY's overall. 6 days is
    // used here on the strength of the two VSSY-specific sources above;
    // flagged rather than presented as fully closed.
    //
    // "VSSY 2.0" naming: NOT used as the canonical display name. The
    // scheme-list page's own descriptive text does refer to an
    // "expanded 2.0 version" of the scheme (not literally a page
    // heading, but the closest match found on re-check) — noted here
    // for reference only, since neither the notification PDF nor the
    // FAQ uses "2.0" anywhere.
    //
    // Toolkit amount: "up to ₹15,000" is retained because the
    // officialUrl page below explicitly states it ("Advanced Toolkit
    // Support: Provide advanced toolkit support of up to ₹15,000 to
    // eligible beneficiaries after completion of training") — confirmed
    // on direct re-fetch, so this is not a guessed figure.
    //
    // Loan language: kept to exactly what's stated on official material
    // reviewed — no amount, lender, interest rate, or repayment terms
    // are stated anywhere across all 4 sources checked.
    benefit:
      '6 days of free skill-enhancement training + advanced, latest-technology toolkit support up to ₹15,000 after successful completion of training. Margin-money loan support may be available; official VSSY material reviewed does not state a scheme-specific loan amount, lender, interest rate, or repayment terms.',
    summary:
      'Skill training, toolkit support, and margin-money loan assistance for Uttar Pradesh artisans across 25 trades (16 traditional — carpenter, blacksmith, potter, tailor, etc. — plus 9 modern trades like mobile and solar-panel repair). Distinct from UP’s separate ODOP Training and Toolkit Scheme, which is not represented in this dataset.',
    officialUrl: 'https://msme1connect.up.gov.in/Home/SchemesList/1',
    // Explicit "Documents Required:" heading in the official UP MSME PDF
    // above. Re-checked 2026-09-05.
    requiredDocuments: [
      'Identity proof — Aadhaar card, Voter ID card, etc.',
      'Proof of age',
      'Caste certificate, if applicable',
      'Disability certificate, if applicable',
      'Any other document, if required',
    ],
    sourceUrl: 'https://msme1connect.up.gov.in/GovernmentScheme/GovernmentScheme638927397130517915.pdf',
    lastVerified: '2026-09-05',
  },
  // TODO(state-schemes): Maharashtra — HOLD, re-checked 2026-09-02.
  // Annasaheb Patil Arthik Vikas Mahamandal (udyog.mahaswayam.gov.in) is
  // confirmed official and currently live, and this pass additionally
  // confirmed it runs two named sub-schemes ("Individual Interest
  // Reimbursement" / IR-I and "Group Loan Interest Reimbursement" / IR-II)
  // — but the portal's own homepage states the target group is
  // specifically "the Maratha community," which does not map cleanly onto
  // this dataset's Category type ('General'|'OBC'|'SC'|'ST'), and no
  // official page fetched this session states an exact loan or interest-
  // subsidy rupee figure (only third-party aggregator sites do, with
  // inconsistent numbers ranging ₹10L–₹50L across sites — not used per
  // the no-fabrication rule). Do not add until both (a) an exact benefit
  // figure and (b) a defensible categories/eligibility mapping are
  // confirmed directly from an official source.
  //
  // TODO(state-schemes): Punjab — HOLD, researched 2026-09-02. Punjab's
  // current official Industrial & Business Development Policy 2022
  // (punjabinfotech.in/assets/pdf/Industrial_Policy_2022.pdf) confirms an
  // "Interest Subsidy" fiscal incentive for startups/MSMEs exists (Section
  // 12.7, Form-IS) but the fetched excerpt did not state the exact
  // percentage or annual cap. A separate official startupindia.gov.in
  // state-policy summary states "8% p.a. for 5 years, capped at ₹5
  // lakh/year" but attributes it to the superseded 2017-2022 policy, so it
  // isn't safe to assume the same rate carried forward unchanged. Most
  // direct Punjab government scheme pages (pbemployment.punjab.gov.in,
  // ghargharrozgar.punjab.gov.in) were unreachable this session
  // (ROBOTS_DISALLOWED/timeout). Do not add until the current rate/cap is
  // confirmed directly from the 2022 policy document or its successor.
  //
  // TODO(state-schemes): Rajasthan — HOLD, researched 2026-09-02. No
  // Rajasthan scheme was added. The state's own myscheme.gov.in listing
  // ("Mukhyamantri Yuva Udyami Yojana") could not be fetched (JS-rendered
  // SPA shell only), and a same/similar-sounding name ("Mukhya Mantri Yuva
  // Udyami Yojana") was found to actually belong to Madhya Pradesh
  // (merayuva.mp.gov.in), while "Mukhyamantri Yuva Udyami Vikas Yojana"
  // appears to be a distinct Uttar Pradesh scheme — a real cross-state
  // naming collision, similar to the Punjab/Pakistan-domain risk already
  // flagged for Task 4. A Rajasthan-specific "Mukhyamantri Yuva Swarozgar
  // Yojana" was found via Vikaspedia (Industries and Commerce Department,
  // Rajasthan; "interest-free loan to youth") but without a specific loan
  // amount or income cap. Do not add until the correct current
  // Rajasthan-specific scheme name and a verified benefit figure are
  // confirmed directly from an official rajasthan.gov.in source.
  {
    id: 'andhra-pradesh-innovation-startup-grant',
    name: 'AP Innovation & Startup Policy 4.0 — Startup Grant',
    isDemo: false,
    ministry: 'Andhra Pradesh Innovation Society (APIS), Department of Information Technology, Electronics & Communication, Government of Andhra Pradesh',
    categories: ['Any'],
    genders: ['Any'],
    states: ['Andhra Pradesh'],
    // Sectors left open: the policy's grant/seed-funding chapters apply to
    // startups generally, not one named sector — a deep-tech-specific
    // higher-value grant also exists under the same policy but is not
    // encoded here since it's a separate, larger benefit tier.
    sectors: ['Any'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    // The policy also offers a larger ₹20 lakh grant specifically for
    // founders from Women/BC/SC/ST/Minority/Differently-Abled backgrounds.
    // This is a higher BENEFIT AMOUNT for those founders, not a narrower
    // ELIGIBILITY GATE — the base grant below stays open to everyone
    // (categories/genders both ['Any']) — so it's represented via
    // `enhancedSupportFor` (informational only, never read by the
    // matching engine) rather than as a separate matching tier. "BC"
    // (Backward Class) still has no exact match in this dataset's
    // Category type, which is fine here since enhancedSupportFor is
    // descriptive text, not a matching value.
    enhancedSupportFor: [
      {
        group: 'Women / BC / SC / ST / Minority / Differently-Abled founders',
        detail: 'Grant up to ₹20 lakh (vs. the base tier below) for a startup with a founder from these backgrounds.',
      },
    ],
    benefit:
      'Upfront grant of up to ₹2 lakh, plus additional grant support up to ₹15 lakh total until product viability is reached, for early-stage startups (a separate, larger ₹20 lakh grant tier exists for underrepresented founders — see enhancedSupportFor)',
    summary:
      "Seed-stage grant support under Andhra Pradesh's Innovation & Startup Policy 4.0 (2024–2029) for startups and students with innovative ideas, administered by the AP Innovation Society.",
    officialUrl: 'https://apit.ap.gov.in/assets/files/2025ITC_36424_MS9_E.pdf',
    // requiredDocuments / applicationSteps intentionally left undefined:
    // re-checked the policy PDF again 2026-09-05, same result as the
    // 2026-09-03 pass — it requires a project proposal (company/founder
    // background, innovation, investment, timeline) for grant approval,
    // and lists specific supporting documents for OTHER incentive lines
    // (e.g. patent reimbursement, event participation), but has no
    // consolidated document/step list for the seed-stage grant this
    // record describes, and defers actual filing to the separate "AP
    // Startup One Portal."
    sourceUrl: 'https://www.startupindia.gov.in/content/sih/en/state-startup-policies/Andhra-Pradesh-state-policy.html',
    lastVerified: '2026-09-05',
  },
  {
    id: 'delhi-composite-loan-scheme',
    name: 'Composite Loan Scheme (CLS)',
    isDemo: false,
    ministry: 'Delhi SC/ST/OBC/Minorities/Handicapped Finance and Development Corporation (DSFDC), Social Welfare Department, Government of NCT of Delhi',
    // Official source lists eligible groups as Scheduled Castes, Scheduled
    // Tribes, Other Backward Classes, Minorities, and Persons with
    // Disabilities. `categories` covers the three caste-based groups;
    // `additionalEligibleGroups` (added 2026-09-02, see SpecialGroup in
    // lib/matching/types.ts) now covers Minority and PwD — a Minority or
    // PwD applicant gets a real category match here even though they
    // aren't SC/ST/OBC, closing the schema gap this comment used to flag.
    categories: ['SC', 'ST', 'OBC'],
    additionalEligibleGroups: ['Minority', 'PwD'],
    genders: ['Any'],
    states: ['Delhi'],
    sectors: ['Any'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    // Official (secondary-corroborated) figure: annual family income from
    // all sources must not exceed ₹1,20,000 — i.e. 1.2 lakh.
    maxIncomeLakh: 1.2,
    // The per-category amount split found (via a secondary source
    // corroborating DSFDC's own published eligibility criteria) only
    // distinguishes "Scheduled Caste: up to ₹3,00,000" vs. "OBC/Minority/
    // PwD: up to ₹1,00,000" — it does not separately state an ST figure,
    // even though ST is listed among eligible groups. Stated as a range
    // here rather than guessing which tier ST falls under.
    benefit:
      'Composite loan of up to ₹3,00,000 (Scheduled Caste applicants) or up to ₹1,00,000 (OBC/Minority/PwD applicants — Scheduled Tribe tier not separately stated in the sources checked), subject to an annual family income cap of ₹1,20,000',
    // See Task 3 (2026-09-03): mirrors the comments above — flagged as a
    // data-confidence caveat, not just an internal note.
    dataConfidenceNote:
      "The Scheduled Tribe benefit tier isn't separately stated in the sources checked — verify the ST amount directly with DSFDC. (The required-document list below is now confirmed directly from DSFDC's own PDF, resolving the earlier hedge.)",
    summary:
      'Composite loan assistance for small business/self-employment for SC/ST/OBC/Minority/PwD applicants below a low income threshold, administered by DSFDC under the Social Welfare Department, Government of NCT of Delhi.',
    officialUrl: 'https://dsfdc.delhi.gov.in/sites/default/files/cls_schem_details.pdf',
    // Re-checked 2026-09-05, resolving the prior hedge below: the
    // official DSFDC PDF's own "Documents Required" section (page 2) was
    // read directly this pass.
    requiredDocuments: [
      'Duly filled Loan Application Form (from a DSFDC branch/HQ, or the official DSFDC website)',
      'Aadhaar card (identity/residence proof)',
      'Caste Certificate (Government of Delhi) — or an affidavit, for minority-community applicants',
      'PWD Certificate from a government hospital (≥40% disability), if applicable',
      'Age proof — Birth Certificate, School Leaving Certificate, or an affidavit',
      'Income Certificate (affidavit)',
      "Affidavit confirming you haven't availed a loan from any other financial institution/government body",
      'Estimate of the items/machines to be procured',
      "Ownership proof of your workplace (electricity/water/telephone bill, or a property document) — or a rent agreement plus the owner's ID proof and a no-objection affidavit if a blood relative owns the premises",
      'Affidavit of personal guarantee',
      'ECS mandate, 5 blank post-dated cheques (for DSFDC), and 1 cancelled cheque (for RTGS)',
      'Additional 5 blank post-dated cheques from your guarantor, if the loan exceeds ₹2 lakh',
      "Affidavit of legal heir, plus the legal heir's photo ID (for succession purposes)",
      'Copy of your PMSBY/PMJJBY insurance receipt',
      'Two witnesses with ID proof, present at the time of application',
    ],
    applicationSteps: [
      'Print the prescribed application form (available from DSFDC).',
      'Fill in all mandatory fields, paste a passport-sized photograph, and attach copies of all mandatory documents (self-attested where required).',
      'Submit the completed, signed application form with documents to the Branch In-Charge / Section In-Charge of DSFDC.',
      'Request a receipt or acknowledgement of your submission.',
    ],
    sourceUrl: 'https://dsfdc.delhi.gov.in/sites/default/files/cls_schem_details.pdf',
    lastVerified: '2026-09-05',
  },
  {
    id: 'gujarat-scheme-for-assistance-startups',
    name: 'Scheme for Assistance for Startups / Innovation',
    isDemo: false,
    ministry: 'Gujarat Startup Cell / Industries Commissionerate, Government of Gujarat',
    // Sectors deliberately left open: the official scheme page domain
    // (startup.gujarat.gov.in) could not be fetched directly this
    // session (blocked/timed out both times it was tried); the figures
    // below are cross-verified via GUSEC (Gujarat University Startup and
    // Entrepreneurship Council, a state-recognised nodal institute for
    // this scheme), which frames some "priority sectors" — but that
    // reads as GUSEC's own incubation focus, not a confirmed hard
    // restriction on this specific scheme, so it isn't encoded here.
    categories: ['Any'],
    // Not gender-restricted — women entrepreneurs get a higher monthly
    // sustenance amount under the same scheme (see benefit text / the
    // structured enhancedSupportFor entry below), not exclusive access.
    genders: ['Any'],
    states: ['Gujarat'],
    sectors: ['Any'],
    stages: ['Idea', 'Early'],
    firstTimeOnly: false,
    maxIncomeLakh: null,
    enhancedSupportFor: [
      {
        group: 'Women entrepreneurs',
        detail: 'Monthly sustenance allowance of ₹25,000 (vs. ₹20,000 base) for up to 1 year.',
      },
    ],
    benefit:
      'Seed support up to ₹30 lakh + monthly sustenance allowance of ₹20,000 (₹25,000/month for women entrepreneurs) for up to 1 year',
    summary:
      'Seed funding and monthly sustenance support for early-stage Gujarat startups incubated or endorsed through an approved nodal institute (e.g. GUSEC), with a higher sustenance amount for women entrepreneurs.',
    // See Task 3 (2026-09-03): mirrors the comment above — flagged as a
    // data-confidence caveat, not just an internal note.
    dataConfidenceNote:
      "The official Gujarat scheme page couldn't be reached this pass — these figures are corroborated via a secondary source (GUSEC) instead of the primary portal.",
    // Re-checked 2026-09-05, correcting the prior note below:
    // startup.gujarat.gov.in itself now loads (via a live browser render)
    // but still has no document checklist, only eligibility/assistance-
    // amount text. The actual checklist is in the scheme's own official
    // "Funding Support to Startups" guidelines PDF (hosted on Gujarat's
    // iNDEXTb/Industrial Extension Bureau infrastructure, which also runs
    // the startup.gujarat.gov.in portal) — listed here for the Seed
    // Support Assistance tier this record describes; other assistance
    // types (sustenance allowance, skill development, acceleration,
    // social impact) have their own shorter lists in the same PDF.
    requiredDocuments: [
      'CV of the founder and co-founder',
      'Detailed Project Report',
      'ROC (Registrar of Companies) certificate',
      'Unique ID (issued by the nodal institute)',
      'Registration/Incorporation Certificate, if available',
      'DIPP Startup Recognition Certificate, if available',
    ],
    officialUrl: 'https://startup.gujarat.gov.in/scheme-for-assistance/scheme-one',
    sourceUrl:
      'https://indextbdemo1.orpgujarat.com/files/2025/3/215b44b0-5c33-4db1-a30c-d4993a583d3b_Guidelines%20for%20Funding%20support%20to%20startups.pdf',
    lastVerified: '2026-09-05',
  },
  {
    id: 'maharashtra-cmegp',
    name: "Chief Minister's Employment Generation Programme (CMEGP)",
    isDemo: false,
    ministry:
      'Directorate of Industries, Government of Maharashtra (implemented via the Maharashtra State Khadi & Village Industries Board in rural areas and District Industries Centres elsewhere)',
    // Open to all categories — General applicants are eligible too, just
    // at a lower margin-money percentage than the "Special" category
    // tier (see enhancedSupportFor below). Not a caste/gender-restricted
    // scheme, so categories/genders stay ['Any'] rather than narrowed to
    // the higher-tier groups.
    categories: ['Any'],
    genders: ['Any'],
    states: ['Maharashtra'],
    // Sectors deliberately narrower than PMEGP's (no Trading): the
    // official source's own loan-limit breakdown is stated only for
    // "manufacturing" and "services."
    sectors: ['Manufacturing', 'Services'],
    stages: ['Idea', 'Early'],
    // Official source: "The applicant should not have availed the
    // subsidy of any Central or State Government scheme" — the closest
    // stated equivalent to a first-time-entrepreneur requirement (same
    // interpretation already used for the national PMEGP entry, which
    // CMEGP is Maharashtra's own state-level parallel to).
    firstTimeOnly: true,
    // Not stated on the source checked — left null rather than guessed.
    maxIncomeLakh: null,
    // Higher benefit tier for certain groups, NOT a narrower eligibility
    // gate — General applicants remain eligible (at the lower tier), so
    // this is informational only via enhancedSupportFor rather than a
    // categories/genders restriction.
    enhancedSupportFor: [
      {
        group: 'SC / ST / OBC / Women / Ex-Servicemen / PwD / North-Eastern Region / Hill & Border applicants',
        detail:
          'Higher margin-money subsidy — 25% (urban) / 35% (rural), vs. 15% (urban) / 25% (rural) for General category — and a lower required own-contribution (5% vs. 10%).',
      },
    ],
    // Age (18–45) and education (7th pass for projects above ₹10 lakh,
    // 10th pass above ₹25 lakh) requirements are stated on the official
    // source but aren't matched by this tool, which doesn't collect age
    // or education — same handling as every other scheme in this dataset
    // with an age/education requirement.
    //
    // Application portal: the official source below references
    // "www.cmegp.gov.in" as the application procedure; a live
    // maha-cmegp.gov.in (.gov.in) domain was found via search but could
    // not be independently fetched this session (blocked/timed out), so
    // it's noted here rather than set as a separate, unverified field.
    benefit:
      'Bank loan of up to ₹50 lakh (manufacturing) or ₹10 lakh (services), with a margin-money subsidy of 15% (urban) / 25% (rural) for General category applicants — see enhancedSupportFor for the higher tier available to other groups',
    summary:
      "Maharashtra's own state-level equivalent of PMEGP: credit-linked margin-money subsidy for setting up new micro and small manufacturing/services enterprises, for applicants aged 18–45 who haven't already availed a subsidy under another central or state scheme (one beneficiary per family).",
    officialUrl: 'https://mskvib.org/en/chief-ministers-employment-generation-programme-cmegp/',
    // Re-checked 2026-09-05, correcting the prior note below: mskvib.org
    // itself still has no checklist, but the scheme's own official
    // "Procedural Guidelines of CMEGP" PDF (Directorate of Industries,
    // Maharashtra) does list the documents applicants upload.
    requiredDocuments: [
      'Passport-size photograph',
      'Aadhaar card',
      'Birth Certificate, School Leaving Certificate, or Domicile Certificate, if required',
      'Educational qualification details',
      'Undertaking Form',
      'Project Report',
      'Caste Certificate / Caste Validity certificate, if applicable',
      'Special Category certificate, if applicable',
      "REDP/EDP/Skill Development training certificate, if you've completed one",
    ],
    sourceUrl: 'https://maha-cmegp.gov.in/resources/application-doc/Guidelines.pdf',
    lastVerified: '2026-09-05',
  },
]
