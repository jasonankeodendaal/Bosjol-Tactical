const fs = require('fs');

const gameTypesStr = `[
    {
        id: 'gt_called_illegal_immigrants',
        name: 'Called Illegal Immigrants',
        category: 'Casual Skirmish',
        description: 'A person with a high-powered gun sits in a chair. The other players have no guns, but they have to reach the seated person without being shot.',
        gameplayMechanics: '• Player Requirement: You need at least 3 people.\n• A person with a high-powered gun sits in a chair.\n• The other players have no guns, but they have to reach the seated person without being shot.',
        rules: 'A person with a high-powered gun sits in a chair. The other players have no guns, but they have to reach the seated person without being shot.',
        participationXp: 50,
        theme: 'Standard',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_rouge_agent',
        name: 'Rouge Agent',
        category: 'Scenario',
        description: 'A game of deception, strategy, and survival.',
        gameplayMechanics: '• At least 4 players on each team.\n• 2 teams (Red and Blue).\n• Rouges switch sides after a time limit.',
        rules: 'Pick 2 teams (Red and Blue). Take out three numbered cards and one face card for every four players on a team. Face cards are Rouge Agents. Rouges switch sides after 5 minutes.',
        participationXp: 75,
        theme: 'MilSim',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_monkey_in_the_middle',
        name: 'Monkey in the Middle',
        category: 'Casual Skirmish',
        description: 'Runners eliminate the opposing team while reviving Hiders to fight for them.',
        gameplayMechanics: '• 3 or more players.\n• 2 teams of 2 Runners.\n• Hiders wait to be revived.',
        rules: 'Runners must eliminate the opposing team while reviving Hiders to fight for them. Play until one team is dead or use Virus rules.',
        participationXp: 50,
        theme: 'Standard',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_operation_manhunt',
        name: 'Operation: Manhunt (Survival Mode)',
        category: 'Scenario',
        description: 'One player is the Target and must survive or escape while others hunt them.',
        gameplayMechanics: '• Target has full loadout.\n• Rest of players track them down.',
        rules: 'Survive until the end of the round or reach extraction.',
        participationXp: 100,
        theme: 'MilSim',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_crash_site_extraction',
        name: 'Crash Site Extraction',
        category: 'MilSim',
        description: '2 to 4 players play as a downed crew awaiting rescue.',
        gameplayMechanics: '• 3 Teams (5-5-1 ratio).\n• Medics revive downed players.\n• Survivors are wounded and can only crawl until treated.',
        rules: 'Win by extracting AT LEAST ONE crew member alive. Survivors have restricted weapons.',
        participationXp: 100,
        theme: 'MilSim',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_treasure_hunt',
        name: 'Treasure Hunt',
        category: 'Scenario',
        description: 'Teams compete to find a treasure box and bring it to their base.',
        gameplayMechanics: '• Carrier cannot use firearms.\n• If dropped, opposing team can take it.',
        rules: 'Bring the treasure back to base to win.',
        participationXp: 75,
        theme: 'Standard',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_bosjol_tactical',
        name: 'Bosjol Tactical: Paratroopers',
        category: 'MilSim',
        description: 'Paratroopers must complete 3 sequential missions while Defenders try to stop them.',
        gameplayMechanics: '• Unlimited lives.\n• Sequential missions.',
        rules: 'Complete all 3 missions to win. Teams swap roles after one finishes or runs out of time.',
        participationXp: 100,
        theme: 'MilSim',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_riot_shield',
        name: 'Riot Shield',
        category: 'CQB',
        description: 'Juggernaut style game where tagging the Riot Shield player makes them join your team.',
        gameplayMechanics: '• Riot shield player uses foam knife.\n• Both teams race to tag them.',
        rules: 'Keep the Riot Shield player on your team for as long as possible.',
        participationXp: 75,
        theme: 'CQB',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_tag',
        name: 'Tag',
        category: 'Speedsoft',
        description: 'A classic game of tag where tagged players join the tagger\'s team.',
        gameplayMechanics: '• Shot players must crouch.\n• Crouched players tagged join the tagger\'s team (max 4).',
        rules: 'Game ends when only one team remains alive.',
        participationXp: 50,
        theme: 'SpeedSoft',
        createdAt: new Date().toISOString()
    },
    {
        id: 'gt_easter_egg_special',
        name: 'Easter Egg Special',
        category: 'Casual Skirmish',
        description: 'Find hidden Easter eggs around the field.',
        gameplayMechanics: '• Collect all eggs.\n• Shot players must drop all eggs.',
        rules: 'The team that secures all the eggs wins.',
        participationXp: 50,
        theme: 'Standard',
        createdAt: new Date().toISOString()
    }
]`;

const content = fs.readFileSync('constants.ts', 'utf8');
const before = content.substring(0, content.indexOf('export const DEFAULT_GAME_TYPES: GameType[] = ['));
const afterMatch = content.substring(content.indexOf('export const MOCK_GAME_TYPES: GameType[] = DEFAULT_GAME_TYPES;'));

const newContent = before + 'export const DEFAULT_GAME_TYPES: GameType[] = ' + gameTypesStr + ';\n\n' + afterMatch;
fs.writeFileSync('constants.ts', newContent);
