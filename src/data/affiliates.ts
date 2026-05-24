export const affiliates = {
  amazon_gpu: "https://amzn.to/4uGfGdl",
  runpod: "https://runpod.io?ref=hpokwpui",
  surfshark: "https://www.dpbolvw.net/click-101748102-15438547",
  pluralsight: "https://www.tkqlhce.com/click-101748102-17152974",
} as const;

export const tagAffiliates = {
  gpu:         [{ key: 'amazon_gpu',  label: 'Upgrade Your GPU',        cta: 'Shop GPUs on Amazon →' }],
  cloud:       [{ key: 'runpod',      label: 'Try Cloud GPU',           cta: 'Run on RunPod →' }],
  'cloud-gpu': [{ key: 'runpod',      label: 'Try Cloud GPU',           cta: 'Run on RunPod →' }],
  tutorial:    [{ key: 'pluralsight', label: 'Learn AI/ML',             cta: 'Courses on Pluralsight →' }],
  course:      [{ key: 'pluralsight', label: 'Learn AI/ML',             cta: 'Courses on Pluralsight →' }],
  vpn:         [{ key: 'surfshark',   label: 'Protect Your AI Traffic', cta: 'Get Surfshark VPN →' }],
  privacy:     [{ key: 'surfshark',   label: 'Protect Your AI Traffic', cta: 'Get Surfshark VPN →' }],
};
