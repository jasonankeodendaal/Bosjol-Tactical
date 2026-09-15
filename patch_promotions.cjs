const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf-8');

// Replace sessionStorage with localStorage globally in App.tsx just for those keys
code = code.replace(/sessionStorage\.getItem\(`lastSeenXp_\${player\.id}`\)/g, "localStorage.getItem(`lastSeenXp_${player.id}`)");
code = code.replace(/sessionStorage\.getItem\(`lastSeenTierId_\${player\.id}`\)/g, "localStorage.getItem(`lastSeenTierId_${player.id}`)");
code = code.replace(/sessionStorage\.getItem\(`lastSeenBadges_\${player\.id}`\)/g, "localStorage.getItem(`lastSeenBadges_${player.id}`)");

code = code.replace(/sessionStorage\.setItem/g, "localStorage.setItem");

// Insert the initialization logic before parsing lastSeenXp
const searchStr = `        const lastSeenXp = parseInt(localStorage.getItem(\`lastSeenXp_\${player.id}\`) || '0', 10);`;
const replaceStr = `        const lastSeenXpStr = localStorage.getItem(\`lastSeenXp_\${player.id}\`);
        if (lastSeenXpStr === null) {
            localStorage.setItem(\`lastSeenXp_\${player.id}\`, String(player.stats.xp));
            localStorage.setItem(\`lastSeenTierId_\${player.id}\`, player.rank?.id || '');
            localStorage.setItem(\`lastSeenBadges_\${player.id}\`, JSON.stringify((player.badges || []).map(b => b.id)));
            return;
        }
        const lastSeenXp = parseInt(lastSeenXpStr, 10);`;

code = code.replace(searchStr, replaceStr);

fs.writeFileSync('App.tsx', code, 'utf-8');
console.log('App.tsx patched successfully.');
