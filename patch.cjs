const fs = require('fs');
let code = fs.readFileSync('data/DataContext.tsx', 'utf8');
code = code.replace(
  "                } else if (key in mock.MOCK_BRANDING_DETAILS) {\n                    (brandingData as any)[key] = finalData[typedKey];\n                    brandingChanged = true;\n                }\n                    (brandingData as any)[key] = finalData[typedKey];\n                    brandingChanged = true;\n                } else if",
  "                } else if (key in mock.MOCK_BRANDING_DETAILS) {\n                    (brandingData as any)[key] = finalData[typedKey];\n                    brandingChanged = true;\n                } else if"
);
fs.writeFileSync('data/DataContext.tsx', code);
