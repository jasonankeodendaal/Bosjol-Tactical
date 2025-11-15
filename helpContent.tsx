import React from 'react';

export interface HelpTopic {
    title: string;
    description: string;
    sections: {
        heading: string;
        content: React.ReactNode;
    }[];
}

export const HELP_CONTENT: Record<string, HelpTopic> = {
    'front-page': {
        title: "Front Page Briefing",
        description: "This is the main entry point to the Bosjol Tactical Dashboard. It serves as an immersive welcome screen before accessing the main application.",
        sections: [
            {
                heading: "Key Features",
                content: (
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Background Carousel:</strong> The background displays a series of images or videos to create a tactical atmosphere. These are managed by the admin in the settings.</li>
                        <li><strong>Gear Up Button:</strong> Clicking 'Gear up and join the team' initiates the enlistment or login process. New recruits are shown an information modal first, while returning operators can proceed to the login screen.</li>
                    </ul>
                )
            },
            {
                heading: "New Recruit Process",
                content: "First-time users who click the main button are presented with the 'New Recruit Information' popup. This modal provides essential information about joining, including age requirements, standard rules, and direct contact links (WhatsApp/Email) with pre-filled templates to streamline the enlistment request to the admin."
            }
        ]
    },
    'login-screen': {
        title: "Authentication Terminal",
        description: "This screen secures access to the dashboard. Both Players and Administrators log in here, but use different credentials.",
        sections: [
            {
                heading: "Login Credentials",
                content: (
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Players:</strong> Log in using the unique <strong>Player Code</strong> assigned to you by an admin (e.g., 'JM01') and your personal 4-digit <strong>PIN</strong>.</li>
                        <li><strong>Administrators:</strong> Log in using your registered <strong>Admin Email</strong> and your Firebase account <strong>Password</strong>.</li>
                    </ul>
                )
            },
            {
                heading: "Automations & Security",
                content: "The system automatically detects whether the identifier is an email (for admin login) or a player code. After 10 minutes of inactivity, you will be automatically logged out for security purposes."
            }
        ]
    },
    // Player Dashboard Topics
    'player-dashboard-overview': {
        title: "Player Dashboard: Overview",
        description: "Your central command hub. This screen provides a snapshot of your current status, progression, and upcoming activities.",
        sections: [
            {
                heading: "Player Profile",
                content: "Displays your avatar, callsign, status, and bio. This information can be updated in the 'Settings' tab."
            },
            {
                heading: "Rank & Progression",
                content: "Shows your current rank, rank points (XP), and progress towards the next rank. Unlocks for your current rank are listed here. You must play at least 10 games to be ranked."
            },
            {
                heading: "Next Mission",
                content: "Highlights the next upcoming event you can join."
            },
            {
                heading: "Sponsors",
                content: "A scrolling banner of official sponsors. You can click on a sponsor to view their details."
            },
            {
                heading: "Automations",
                content: "Your rank is automatically calculated based on your total XP. The progression bar fills as you earn XP, and you will rank up automatically upon reaching the next XP threshold."
            }
        ]
    },
    'player-dashboard-events': {
        title: "Player Dashboard: Events",
        description: "View and manage your participation in all official events.",
        sections: [
            {
                heading: "Event Schedule",
                content: "Toggle between 'Upcoming' and 'Past' events. Click on any event card to view its full details, including location, rules, and fees."
            },
            {
                heading: "Event Registration",
                content: "In the event details modal for an upcoming event, you can register your attendance. You can also select rental gear if available. The total cost is calculated for you."
            },
            {
                heading: "Automations",
                content: "The availability of rental gear is updated in real-time. If an item is fully booked by other players, it will show as 'Out of Stock', preventing overbooking."
            }
        ]
    },
    'player-dashboard-raffles': {
        title: "Player Dashboard: Raffles",
        description: "Participate in gear giveaways and see past winners.",
        sections: [
            {
                heading: "My Raffle Tickets",
                content: "This section displays all the raffle tickets you have purchased for upcoming draws."
            },
            {
                heading: "Past Raffle Results",
                content: "View the results of completed raffles, including the prizes and the players who won them."
            },
            {
                heading: "Automations",
                content: "Once an admin draws the winners for a raffle, the results are immediately displayed here. If you are a winner, a special notification will appear at the top of this tab."
            }
        ]
    },
    'player-dashboard-stats': {
        title: "Player Dashboard: Stats",
        description: "A detailed breakdown of your in-game performance.",
        sections: [
            {
                heading: "Lifetime Stats",
                content: "An overview of your entire career, including K/D Ratio, total kills, deaths, headshots, matches played, and total Rank Points (XP)."
            },
            {
                heading: "Match History",
                content: "A list of every past match you've played, showing your specific stats (Kills, Deaths, Headshots) for each one."
            },
            {
                heading: "Best Match",
                content: "Highlights your single best performance on record, based on the highest number of kills in a single match."
            },
            {
                heading: "Automations",
                content: "All stats are automatically updated after an admin finalizes an event you attended. Your K/D ratio and other metrics are calculated in real-time based on your lifetime stats."
            }
        ]
    },
    'player-dashboard-achievements': {
        title: "Player Dashboard: Achievements",
        description: "Track your progress towards earning special commendations.",
        sections: [
            {
                heading: "Badge Progress",
                content: "These are standard achievements with clear goals (e.g., 'Achieve 50 headshots'). The progress bar shows how close you are to unlocking each one."
            },
            {
                heading: "Legendary Commendations",
                content: "These are rare and prestigious awards given out manually by admins for exceptional performance, sportsmanship, or tactical brilliance."
            },
            {
                heading: "Automations",
                content: "Your progress towards Standard Badges is automatically calculated based on your lifetime stats. Once you meet the criteria for a badge, it will be unlocked and awarded to you instantly."
            }
        ]
    },
    'player-dashboard-leaderboard': {
        title: "Player Dashboard: Leaderboard",
        description: "See how you stack up against every other operator in the organization.",
        sections: [
            {
                heading: "Podium",
                content: "The top three players are featured in a special podium display at the top of the leaderboard."
            },
            {
                heading: "Global Rankings",
                content: "A ranked list of all players, sorted by their total Rank Points (XP). Your own position is highlighted for easy reference."
            },
            {
                heading: "Automations",
                content: "The leaderboard is updated in real-time. As soon as any player's XP changes, their position on the leaderboard is automatically recalculated and displayed."
            }
        ]
    },
    'player-dashboard-settings': {
        title: "Player Dashboard: Settings",
        description: "Customize your operator profile and personal information.",
        sections: [
            {
                heading: "Profile Customization",
                content: "You can update your avatar, first name, last name, callsign, and write a short bio. You can also set your preferred in-game role (e.g., Assault, Recon)."
            },
            {
                heading: "Personal Details",
                content: "Update your contact information, address, and important medical details like allergies. This information is visible to admins to ensure your safety during events."
            },
            {
                heading: "Automations",
                content: "When you save changes, your profile is instantly updated across the entire application, including the admin dashboard and the global leaderboard."
            }
        ]
    },
    // Admin Dashboard Topics
    'admin-dashboard-events': {
        title: "Admin: Event Management",
        description: "Create, view, and manage all game events.",
        sections: [
            {
                heading: "Event List",
                content: "Toggle between 'Upcoming' and 'Past' events. Click 'Create New Event' to open the event editor for a new event, or click an existing event card to manage it."
            },
            {
                heading: "Event Management",
                content: "From the manage event page, you can edit all event details, check in players, track live stats during a game, manage payments, and finalize the event to award XP."
            }
        ]
    },
    'admin-dashboard-players': {
        title: "Admin: Player Management",
        description: "Oversee and manage all registered players.",
        sections: [
            {
                heading: "Player Roster",
                content: "View a sortable list of all players. You can search by name, callsign, or player code. Click on a player to view their detailed profile page."
            },
            {
                heading: "Add New Player",
                content: "Register a new player by filling in their essential details. A unique Player Code will be automatically generated."
            },
            {
                heading: "Automations",
                content: "When creating a new player, the system automatically generates a unique Player Code based on their initials and a sequential number (e.g., John Smith becomes JS01, Jane Smith becomes JS02) to prevent duplicates."
            }
        ]
    },
    'admin-dashboard-progression': {
        title: "Admin: Progression Settings",
        description: "Define the rules for player advancement, including XP, ranks, and badges.",
        sections: [
            {
                heading: "Gamification Settings",
                content: "Set the base XP values for in-game actions like kills, headshots, and deaths. These values are used to automatically calculate XP awards when an event is finalized."
            },
            {
                heading: "Standard & Legendary Badges",
                content: "Create and manage the badges players can earn. Standard badges have automated criteria (e.g., 50 kills), while Legendary badges are awarded manually from a player's profile."
            }
        ]
    },
    'admin-dashboard-inventory': {
        title: "Admin: Inventory Management",
        description: "Track all physical assets, from rental gear to items for sale.",
        sections: [
            {
                heading: "Inventory List",
                content: "View, add, edit, and delete all items. You can set stock levels, pricing, category, condition, and whether an item is available for rental."
            },
            {
                heading: "Automations",
                content: "Items with stock levels that fall below their 'Re-order Level' will have their stock count highlighted in red, signaling that they need to be replenished."
            }
        ]
    },
    'admin-dashboard-locations': {
        title: "Admin: Location Management",
        description: "Manage the list of game fields and locations.",
        sections: [
            {
                heading: "Location Editor",
                content: "Add, edit, or delete locations. You can include a name, address, description, contact info, Google Maps link, and multiple images for each location. This information is shown to players when they view event details."
            }
        ]
    },
    'admin-dashboard-suppliers': {
        title: "Admin: Supplier Management",
        description: "Keep a record of all your equipment and consumable suppliers.",
        sections: [
            {
                heading: "Supplier Directory",
                content: "Maintain a list of suppliers with their contact details. This is used for reference and can be linked to inventory items."
            }
        ]
    },
    'admin-dashboard-finance': {
        title: "Admin: Financial Dashboard",
        description: "A powerful tool to track revenue, expenses, and profitability.",
        sections: [
            {
                heading: "Financial Controls & Filters",
                content: "Filter the financial data by time period, specific player, event, or location to generate detailed reports."
            },
            {
                heading: "Key Metrics",
                content: "View high-level metrics like Total Revenue, Expenses, Net Profit, and Outstanding payments."
            },
            {
                heading: "Printable Reports",
                content: "Generate a clean, printable financial report based on your currently selected filters."
            },
            {
                heading: "Automations",
                content: "When you finalize an event, the system automatically generates 'Event Revenue' and 'Rental Revenue' transactions for every paid attendee. All charts and metrics on this page update in real-time as new transactions are created."
            }
        ]
    },
    'admin-dashboard-vouchers---raffles': {
        title: "Admin: Vouchers & Raffles",
        description: "Manage discount vouchers and create raffle events.",
        sections: [
            {
                heading: "Vouchers",
                content: "Create voucher codes that players can use. Vouchers can be a fixed amount or a percentage, with limits on total uses or per-player uses. They can also be assigned to a specific player."
            },
            {
                heading: "Raffles",
                content: "Create raffle events with up to three prizes. Players can view these on their dashboard. Once a raffle is active, you can click 'Draw Winners' to finalize it."
            },
            {
                heading: "Automations",
                content: "Clicking 'Draw Winners' on an active raffle automatically and randomly selects winners from the pool of purchased tickets, assigns them to the prizes, and marks the raffle as 'Completed'. The results are then immediately visible to all players."
            }
        ]
    },
     'admin-dashboard-sponsors': {
        title: "Admin: Sponsor Management",
        description: "Manage the sponsors that appear on the player dashboard.",
        sections: [
            {
                heading: "Sponsor List",
                content: "Add, edit, or remove sponsors. Each sponsor can have a name, logo, and contact details. The logos you upload here will appear in the scrolling sponsor bar on the player's overview tab."
            }
        ]
    },
    'admin-dashboard-leaderboard': {
        title: "Admin: Global Leaderboard",
        description: "View the global player rankings.",
        sections: [
            {
                heading: "Live Rankings",
                content: "This shows the same real-time leaderboard that players see, allowing you to monitor player progression and standings at a glance."
            }
        ]
    },
     'admin-dashboard-settings': {
        title: "Admin: System Settings",
        description: "Configure the global settings and appearance of the entire application.",
        sections: [
            {
                heading: "Branding & Visuals",
                content: "Upload your company logo, and set custom background images/videos for the login screen and dashboards. You can also add login screen music."
            },
            {
                heading: "Content Settings",
                content: "Set the minimum signup age, define the fixed event rules shown to new recruits, and manage the media for the front page carousel."
            },
            {
                heading: "Social Links",
                content: "Add and manage the social media links that appear on the login screen."
            },
            {
                heading: "Danger Zone",
                content: "Contains a tool to wipe all transactional data (players, events, etc.) from the database, resetting it to a clean slate without losing system configurations like ranks and badges. Use with extreme caution."
            }
        ]
    },
     'admin-dashboard-api-setup': {
        title: "Admin: API Server Setup",
        description: "This section provides a complete guide for setting up an optional, self-hosted API server.",
        sections: [
            {
                heading: "Purpose",
                content: "The default Firebase setup has a 1MB limit for documents, which makes uploading large files (like videos for the login screen) impossible. This external server handles all file uploads, bypassing the limit entirely. It also provides a path to move all data handling off of the client-side Firebase connection for enhanced security and scalability."
            },
            {
                heading: "Guide",
                content: "The guide provides step-by-step instructions, including prerequisites, server code, and deployment recommendations using PM2 and Cloudflare Tunnels to make your local server publicly accessible."
            }
        ]
    },
    // Page-specific Topics
    'admin-player-profile': {
        title: "Admin: Manage Player Profile",
        description: "This is the detailed administrative view of a single player's profile. Here you can edit their data and perform special actions.",
        sections: [
            {
                heading: "Edit Profile",
                content: "Click 'Edit Profile' to modify any of the player's details, including their name, callsign, status, contact info, and even their 4-digit PIN."
            },
            {
                heading: "Award Manual XP",
                content: "Use the 'Award XP' button to grant or deduct Rank Points for reasons outside of normal gameplay (e.g., bonus for sportsmanship, penalty for rule-breaking). These adjustments and their reasons are visible to the player in their XP History."
            },
            {
                heading: "Award Legendary Badges",
                content: "Bestow prestigious Legendary Badges upon deserving players. These are special commendations that cannot be earned automatically."
            }
        ]
    },
    'admin-manage-event': {
        title: "Admin: Manage Event",
        description: "This is the control center for a single event, from setup to finalization.",
        sections: [
            {
                heading: "Event Details",
                content: "Edit all core information about the event, such as its title, date, location, rules, and associated fees and XP."
            },
            {
                heading: "Attendees Management",
                content: "When the event is 'Upcoming', you can see a list of players who have signed up. When you are ready to start, change the event status to 'In Progress'. You can then 'Check In' players from the signup list, moving them to the 'Checked In' list."
            },
            {
                heading: "Payment Tracking",
                content: "For each checked-in player, you can mark their payment status as 'Paid (Card)', 'Paid (Cash)', or 'Unpaid'. This is crucial for financial tracking."
            },
            {
                heading: "Live Stat Tracking",
                content: "While the event is 'In Progress', the 'Live Game Stats' panel appears. Here you can enter kills, deaths, and headshots for each attendee in real-time as the game unfolds."
            },
            {
                heading: "Finalize Event (Automation)",
                content: (
                    <div>
                        <p>This is the most powerful automation. When you click 'Finalize Event':</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                            <li>The event status is automatically set to 'Completed'.</li>
                            <li>The system calculates the total XP earned for each player based on participation XP and the live stats you entered.</li>
                            <li>Each player's lifetime stats (kills, deaths, games played, XP) are updated.</li>
                            <li>A permanent Match History record is created for each player for this event.</li>
                            <li>Financial transactions are automatically generated for event fees and gear rentals for all 'Paid' attendees.</li>
                            <li>All automated progression systems (Ranks, Badges, Leaderboard) are instantly updated with the new data.</li>
                        </ul>
                    </div>
                )
            }
        ]
    }
};
