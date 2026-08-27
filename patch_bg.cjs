const fs = require('fs');
let code = fs.readFileSync('components/DashboardBackground.tsx', 'utf8');
code = code.replace(
  "style={{ backgroundImage: `url(${url})` }}",
  "style={{ backgroundImage: `url(\"${url}\")` }}"
);
fs.writeFileSync('components/DashboardBackground.tsx', code);

code = fs.readFileSync('components/LoginScreen.tsx', 'utf8');
code = code.replace(
  "style={{ backgroundImage: `url(${url})` }}",
  "style={{ backgroundImage: `url(\"${url}\")` }}"
);
fs.writeFileSync('components/LoginScreen.tsx', code);
