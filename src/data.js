export const sources = {
  who: 'https://www.who.int/news-room/fact-sheets/detail/hiv-aids',
  testing: 'https://www.cdc.gov/hiv/testing/index.html',
  pep: 'https://www.cdc.gov/hivnexus/hcp/pep/index.html',
  prep: 'https://www.cdc.gov/hiv/prevention/prep.html',
  uu: 'https://www.cdc.gov/global-hiv-tb/php/our-approach/undetectable-untransmittable.html',
  lifecycle: 'https://hivinfo.nih.gov/understanding-hiv/fact-sheets/hiv-life-cycle',
  assembly: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3385941/',
  capsid: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3729984/',
  env: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4348022/',
  genome: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4876022/',
  locator: 'https://gettested.cdc.gov/',
};

export const chapters = [
  { id: 'basics', number: '01', short: 'The basics', title: 'Start with the science.', description: 'What HIV is, how it affects the immune system, and why HIV is not the same as AIDS.', time: '4 min', color: 'coral' },
  { id: 'transmission', number: '02', short: 'Transmission', title: 'Facts over fear.', description: 'Understand the conditions for transmission and the everyday contact that carries no risk.', time: '5 min', color: 'sand' },
  { id: 'prevention', number: '03', short: 'Prevention', title: 'More ways to protect.', description: 'Condoms, PrEP, PEP, sterile equipment, and treatment as prevention. Choose what fits.', time: '6 min', color: 'sage' },
  { id: 'testing', number: '04', short: 'Testing', title: 'Know your status.', description: 'Compare HIV tests, understand window periods, and know what to do with a result.', time: '5 min', color: 'lavender' },
  { id: 'treatment', number: '05', short: 'Treatment', title: 'Treatment changes the story.', description: 'How antiretroviral therapy protects health and leads to an undetectable viral load.', time: '5 min', color: 'peach' },
  { id: 'living', number: '06', short: 'Living well', title: 'A full life. Without stigma.', description: 'Care, connection, relationships, and practical ways to replace judgment with support.', time: '4 min', color: 'sky' },
];

export const virusLayers = [
  {
    id: 'envelope', label: 'Lipid envelope', tag: 'Host-derived bilayer', color: '#b38b79',
    text: 'A host-cell-derived lipid bilayer forms the roughly spherical outer boundary. The two leaflets are only a few nanometres thick.',
    detail: 'The cutaway removes part of the membrane to expose the interior; the intact virion is enclosed. Fine membrane texture is illustrative, not a lipid-by-lipid reconstruction.',
    source: 'assembly',
  },
  {
    id: 'spikes', label: 'Env trimers', tag: 'gp120 + gp41', color: '#e5d6b6',
    text: 'Each envelope spike contains three globular gp120 subunits and three gp41 subunits. gp120 binds CD4; gp41 anchors the trimer and drives membrane fusion.',
    detail: 'This model shows 14 irregularly distributed trimers, within the approximately 7–14 reported for HIV-1. Env is sparse—not a dense coat of identical knobs.',
    source: 'env',
  },
  {
    id: 'capsid', label: 'p24 capsid', tag: 'Closed fullerene cone', color: '#c99a5f',
    text: 'About 1,200 CA/p24 proteins assemble into a closed, asymmetric conical capsid with a broad end and a narrow, rounded end.',
    detail: 'CA hexamers form most of the lattice; exactly 12 pentamers allow closure. The teaching window is a section through this otherwise enclosed shell, not an open biological capsid.',
    source: 'capsid',
  },
  {
    id: 'matrix', label: 'p17 matrix', tag: 'Beneath the membrane', color: '#7d8e76',
    text: 'MA/p17 proteins remain associated with the inner leaflet of the lipid envelope, forming a thin, discontinuous matrix layer.',
    detail: 'The matrix lines the envelope and is distinct from the separate p24 capsid. Individual protein shapes and spacing here are simplified.',
    source: 'assembly',
  },
  {
    id: 'rna', label: 'RNA + nucleocapsid', tag: 'Two genomic RNA copies', color: '#86b9aa',
    text: 'Two copies of positive-sense, single-stranded RNA are packaged with nucleocapsid (NC) protein inside the capsid, mainly toward its broad end.',
    detail: 'The RNAs form a dimer at their 5′ ends. Their intertwined paths here communicate two condensed strands; they are not an atomic model or a DNA-like base-paired double helix.',
    source: 'assembly',
  },
  {
    id: 'reverseTranscriptase', label: 'Reverse transcriptase', tag: 'RNA → DNA', color: '#78a99a',
    text: 'Reverse transcriptase is packaged with the genome inside the capsid. After entry, it copies viral RNA into DNA.',
    detail: 'NRTI and NNRTI medicines inhibit this enzyme. The multi-lobed shape is a molecular-style teaching symbol, not an atomistic structure.',
    source: 'genome',
  },
  {
    id: 'integrase', label: 'Integrase', tag: 'DNA integration', color: '#8a91b3',
    text: 'Integrase is another enzyme carried within the capsid. It inserts the viral DNA copy into the host cell genome.',
    detail: 'Integrase strand transfer inhibitors block this step. Its position beside the condensed genome is schematic; internal molecular packing is not resolved at this scale.',
    source: 'genome',
  },
  {
    id: 'protease', label: 'Protease', tag: 'Virion maturation', color: '#b68491',
    text: 'HIV protease is a dimer that cleaves Gag and Gag–Pol polyproteins so a newly budded particle can become infectious.',
    detail: 'The dimer is shown in the virion interior outside the capsid. Protease inhibitors block maturation; the exact arrangement of free internal proteins is not asserted.',
    source: 'assembly',
  },
];

export const transmissionFacts = [
  { title: 'Sex without prevention', text: 'HIV can pass through semen, pre-seminal fluid, vaginal fluids, and rectal fluids during anal or vaginal sex. Condoms, PrEP, and U=U are effective prevention options.', possible: true },
  { title: 'Shared injection equipment', text: 'Needles, syringes, and other equipment can carry infected blood. New sterile equipment and harm-reduction services reduce risk.', possible: true },
  { title: 'Pregnancy, birth, or breastfeeding', text: 'HIV can pass to a child during pregnancy, delivery, or breastfeeding. Timely ART and clinical care greatly reduce this risk.', possible: true },
  { title: 'Unscreened blood or unsterile procedures', text: 'Transmission can occur through unsafe injections, unscreened blood products, or unsterile cutting and piercing. Screening and sterile practice prevent this.', possible: true },
  { title: 'Hugs, handshakes, or kisses', text: 'HIV is not spread through ordinary social contact. Touch, hugs, handshakes, and closed-mouth kisses are safe.', possible: false },
  { title: 'Sharing food, water, or toilets', text: 'HIV does not spread through meals, drinking water, dishes, utensils, bathrooms, or sharing personal objects.', possible: false },
  { title: 'Coughs, sneezes, sweat, or tears', text: 'Everyday respiratory contact and non-blood-contaminated saliva, sweat, tears, or urine do not transmit HIV.', possible: false },
  { title: 'Insect bites', text: 'Mosquitoes and other insects do not transmit HIV. HIV does not reproduce in insects, and insects do not inject another person’s blood.', possible: false },
];

export const testTypes = [
  { id: 'antibody', name: 'Antibody test', short: 'Antibody', sample: 'Blood or oral fluid', detects: 'HIV antibodies', start: 23, end: 90, timing: 'Rapid results often available in 30 minutes or less; many self-tests use this method.', source: 'CDC' },
  { id: 'rapid', name: 'Rapid antigen/antibody', short: 'Rapid Ag/Ab', sample: 'Finger-stick blood', detects: 'HIV antibodies and p24 antigen', start: 18, end: 90, timing: 'Results are often available in 30 minutes or less.', source: 'CDC' },
  { id: 'lab', name: 'Laboratory antigen/antibody', short: 'Lab Ag/Ab', sample: 'Blood from a vein', detects: 'HIV antibodies and p24 antigen', start: 18, end: 45, timing: 'Laboratory results may take several days.', source: 'CDC' },
  { id: 'nat', name: 'Nucleic acid test (NAT)', short: 'NAT', sample: 'Blood from a vein', detects: 'The virus itself', start: 10, end: 33, timing: 'Usually performed in a laboratory; a clinician can advise when it is appropriate.', source: 'CDC' },
];

export const preventionOptions = [
  { id: 'condoms', number: '01', title: 'Condoms', tag: 'Barrier protection', text: 'External or internal condoms reduce the chance of HIV transmission during sex. They also help prevent certain other STIs and pregnancy.', action: 'Use a new condom correctly every time, and follow its instructions.', type: 'Before & during sex' },
  { id: 'prep', number: '02', title: 'PrEP', tag: 'Before exposure', text: 'Pre-exposure prophylaxis is medicine for people without HIV that greatly reduces the chance of acquiring HIV through sex or injection drug use.', action: 'Talk with a healthcare provider about oral or long-acting injectable options. HIV testing and routine follow-up are part of PrEP care. PrEP does not prevent other STIs or pregnancy.', type: 'Ongoing prevention' },
  { id: 'pep', number: '03', title: 'PEP', tag: 'After exposure', text: 'Post-exposure prophylaxis is emergency medicine used after a possible exposure. Start as soon as possible, ideally within 24 hours and no later than 72 hours.', action: 'Go immediately to an emergency department, urgent care clinic, or healthcare provider. A standard course lasts 28 days. Do not wait for this website or a test result to seek care.', type: 'Time-sensitive emergency' },
  { id: 'art', number: '04', title: 'ART & U=U', tag: 'Treatment as prevention', text: 'Antiretroviral therapy lowers the amount of HIV in the body. A person who maintains an undetectable viral load has zero risk of sexual transmission to partners.', action: 'Maintain treatment and follow-up care. U=U applies to sexual transmission; use other relevant prevention for nonsexual exposure routes and other STIs.', type: 'For people living with HIV' },
  { id: 'equipment', number: '05', title: 'Sterile equipment', tag: 'Safer injection', text: 'New, sterile needles, syringes, and injection equipment prevent blood-to-blood transmission. Avoid sharing any equipment used to prepare or inject drugs.', action: 'Use a local syringe service or harm-reduction program. These services can also connect people to testing, treatment, and support.', type: 'Harm reduction' },
  { id: 'pregnancy', number: '06', title: 'Care during pregnancy', tag: 'Parent & child health', text: 'HIV testing, prompt ART, and care during pregnancy and after birth can greatly reduce transmission to a child while protecting the parent’s health.', action: 'Seek HIV care as early as possible. Discuss delivery and infant feeding with a specialist who knows local guidance and available options.', type: 'Specialist-supported care' },
];

export const lifecycle = [
  { id: 0, step: '01', title: 'Binding', short: 'Connect', text: 'HIV attaches to a receptor on the surface of a CD4 immune cell.', science: 'Surface proteins on HIV attach to the CD4 receptor and a co-receptor.', intervention: 'Some entry inhibitors interfere with attachment or co-receptor binding.' },
  { id: 1, step: '02', title: 'Fusion', short: 'Enter', text: 'The viral envelope joins with the cell membrane, allowing the capsid to enter.', science: 'The membranes merge and HIV releases its contents into the CD4 cell.', intervention: 'Fusion inhibitors can block this entry step.' },
  { id: 2, step: '03', title: 'Reverse transcription', short: 'Copy', text: 'HIV converts its RNA into DNA using the reverse transcriptase enzyme.', science: 'The genetic code changes from viral RNA into a DNA copy inside the cell.', intervention: 'NRTIs and NNRTIs block reverse transcriptase in different ways.' },
  { id: 3, step: '04', title: 'Integration', short: 'Integrate', text: 'Viral DNA enters the cell nucleus and joins the cell’s own DNA.', science: 'The HIV integrase enzyme inserts viral DNA into the host genome.', intervention: 'Integrase strand transfer inhibitors block this step.' },
  { id: 4, step: '05', title: 'Replication', short: 'Make parts', text: 'The cell uses integrated viral DNA to make long chains of HIV proteins and RNA.', science: 'The infected cell becomes a factory for new viral components.', intervention: 'Effective combination ART interrupts the cycle before new infectious virus is produced.' },
  { id: 5, step: '06', title: 'Assembly', short: 'Assemble', text: 'New HIV proteins and RNA gather at the cell surface and form immature virus particles.', science: 'The components come together near the cell membrane.', intervention: 'Protease inhibitors act on the maturation process that follows.' },
  { id: 6, step: '07', title: 'Budding & maturation', short: 'Release', text: 'The virus buds from the cell. Protease processes viral proteins so the new virus can mature.', science: 'Newly released virus can then infect other CD4 cells if the cycle is not interrupted.', intervention: 'Protease inhibitors prevent the final processing needed for infectious virus.' },
];

export const quizQuestions = [
  { question: 'Can HIV spread by sharing a meal with someone?', options: ['Yes, through shared utensils', 'Only if the food is uncooked', 'No, everyday contact does not transmit HIV', 'Only before a person starts treatment'], answer: 2, explanation: 'HIV is not spread through food, water, dishes, hugs, handshakes, or other everyday contact.' },
  { question: 'What does U=U mean?', options: ['An undetectable viral load means zero risk of sexual HIV transmission', 'A negative test always rules out a recent exposure', 'HIV treatment is no longer needed', 'HIV cannot be transmitted in any situation'], answer: 0, explanation: 'A person on treatment who maintains an undetectable viral load has zero risk of transmitting HIV to sexual partners. Ongoing treatment and care matter.' },
  { question: 'When should someone seek PEP after a possible exposure?', options: ['Within one week', 'As soon as possible, and no later than 72 hours', 'Only if symptoms appear', 'After a positive self-test'], answer: 1, explanation: 'PEP is time-sensitive. Start as soon as possible, ideally within 24 hours and no later than 72 hours. Seek urgent medical care.' },
  { question: 'What is the only way to know your HIV status?', options: ['Checking for symptoms', 'A partner’s test result', 'A physical examination', 'Getting an HIV test'], answer: 3, explanation: 'A person can have HIV without symptoms. Only an HIV test can determine HIV status.' },
  { question: 'Which statement about PrEP is accurate?', options: ['It is emergency medicine started after exposure', 'It cures HIV', 'It prevents HIV when taken as prescribed, but not other STIs', 'It replaces the need for HIV testing'], answer: 2, explanation: 'PrEP is medicine for people without HIV. It greatly reduces HIV risk when taken as prescribed. Testing and follow-up remain important.' },
  { question: 'Which is an accurate, supportive way to respond to someone’s HIV diagnosis?', options: ['Ask how they acquired it', 'Avoid physical contact', 'Listen, respect privacy, and support access to care', 'Tell others so they can protect themselves'], answer: 2, explanation: 'A diagnosis is personal health information. Listening, respecting confidentiality, and supporting care help replace stigma with dignity.' },
];

export const glossary = [
  { term: 'Antiretroviral therapy (ART)', definition: 'Treatment using a combination of HIV medicines. ART prevents HIV from multiplying and helps protect the immune system.' },
  { term: 'CD4 cell', definition: 'A type of white blood cell that helps coordinate the immune response. HIV targets and can reduce these cells.' },
  { term: 'Undetectable viral load', definition: 'A viral load so low that the test used cannot detect it. It does not mean HIV has been cured.' },
  { term: 'U=U', definition: 'Undetectable equals untransmittable: maintaining an undetectable viral load means zero risk of sexual HIV transmission.' },
  { term: 'Window period', definition: 'The time between HIV exposure and when a particular test can reliably detect infection. It varies by test type.' },
  { term: 'PrEP / PEP', definition: 'Medicines used to prevent HIV before possible exposure (PrEP) or after a recent possible exposure (PEP).' },
];
