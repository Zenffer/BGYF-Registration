// ===================================================================
//  EVENT PROGRAM — edit this file when the program changes.
//  Each item: { time, title, by?, details? }
//    by      → who leads / the church in charge (optional)
//    details → list of lines; a line can be a string or
//              { label: '...', items: ['...', '...'] } for a sub-list
// ===================================================================

const PROGRAM_UPDATED = 'Updated program as of September 26, 2026';

const VESPER = (speaker, leader, call, prayer, hymn, special, text, offNum, offPrayer, closing) => [
    'Speaker: ' + speaker,
    'Leader: ' + leader,
    'Prelude',
    'Call to Worship: ' + call,
    'Opening Prayer: ' + prayer,
    'Opening Hymn: ' + hymn,
    'Special Number: ' + special,
    'Message: ' + speaker,
    "Giver's Text: " + text,
    'Offertory Number: ' + offNum,
    'Offertory Prayer: ' + offPrayer,
    'Closing Hymn: ' + closing,
    'Closing Prayer and Benediction: Speaker',
];

const PROGRAM = [
    {
        day: 'Day 1',
        date: 'Sun, Dec 27',
        items: [
            { time: '1:00 PM', title: 'Arrival and Registration' },
            { time: '4:00 PM', title: 'Orientation', by: 'Rules and Regulations' },
            { time: '5:00 PM', title: 'Preparation and Dinner' },
            { time: '6:45 PM', title: 'Praise and Worship', by: 'Daraga Grace Gospel Church of Christ' },
            {
                time: '7:00 PM', title: 'Vesper', by: 'Ptr. Marcelino Marfil',
                details: VESPER('Ptr. Marcelino Marfil', 'James Orly Longakit', 'Psalms 100:1-5', 'Ptr. Joel Bruzo',
                    'Living for Jesus', 'BGYO Officers', '1 Corinthians 9:6-10',
                    'Ligao Grace Gospel Church of Christ', 'Rev. Sonjhail Deguiñon', 'I am Thine O Lord'),
            },
            {
                time: '8:00 PM', title: 'Processional and Opening Program',
                details: [
                    { label: 'Processional', items: ["Workers (include pastor's wife)", 'Bible Students', 'BGYO Officers', 'Recognition of Churches', 'Welcome ceremony to newcomers', "Pastor's appreciation from BGYO"] },
                    'Welcome Address: Ptr. Anthony Cal',
                    'Welcome Intermission: Daraga Grace Youth',
                    { label: 'Groupings, Acquaintances and Rules', items: ['Flag making', 'Yell making'] },
                ],
            },
            { time: '9:30 PM', title: 'Lights Off' },
        ],
    },
    {
        day: 'Day 2',
        date: 'Mon, Dec 28',
        items: [
            { time: '6:00 AM', title: 'Wake Up Time and Devotion', by: 'Per quarter' },
            { time: '6:30 AM', title: 'Personal Preparation and Breakfast' },
            { time: '7:30 AM', title: 'Praise and Worship', by: 'Guinobatan Grace Gospel Church of Christ' },
            {
                time: '8:00 AM', title: 'Lecture 1: Doctrine (Total Depravity)',
                details: [{ label: 'Lecturers', items: ['Ages 13–15: Ptr. Anthony Cal', 'Ages 16–18: Ptr. Bhren Banac', 'Ages 19 and up: Ptr. Elmer Rosero'] }],
            },
            { time: '9:00 AM', title: 'Snacks' },
            {
                time: '9:30 AM', title: 'Lecture 2: Salvation',
                details: [{ label: 'Lecturers', items: ['Ptr. Ian Rosales', 'Ptr. Kenneth Rosero', 'Ptr. Levi Seva'] }],
            },
            { time: '10:30 AM', title: 'Bible Games & Team Games' },
            { time: '11:30 AM', title: 'Lunch and Siesta' },
            { time: '1:00 PM', title: 'Praise and Worship', by: 'Nogpo Grace Gospel Church of Christ' },
            { time: '1:15 PM', title: 'Teaching and Instrumental Competition' },
            { time: '3:00 PM', title: 'Sports Fest' },
            { time: '5:00 PM', title: 'Personal Preparation' },
            { time: '6:00 PM', title: 'Dinner' },
            { time: '6:45 PM', title: 'Praise and Worship', by: 'Jovellar Grace Gospel Church of Christ' },
            {
                time: '7:00 PM', title: 'Vesper', by: 'Ptr. Jose Condrillon',
                details: VESPER('Ptr. Jose Condrillon', 'Mark Taduran', 'Psalms 95:1-6', 'Ptr. Bhren Banac',
                    'I Surrender All', 'Tabaco Grace Gospel Church of Christ', 'Malachi 3:10',
                    'Bonbon Grace Gospel Church of Christ', 'Ptr. Anthony Cal', 'I am Resolved'),
            },
            { time: '8:00 PM', title: 'Singing Contest', by: 'Solo, Duet, Trio' },
            { time: '9:30 PM', title: 'Announcements' },
            { time: '10:00 PM', title: 'Lights Off' },
        ],
    },
    {
        day: 'Day 3',
        date: 'Tue, Dec 29',
        items: [
            { time: '6:00 AM', title: 'Wake Up Time and Devotion', by: 'Per quarter' },
            { time: '6:30 AM', title: 'Personal Preparation and Breakfast' },
            { time: '7:30 AM', title: 'Praise and Worship', by: 'Mampirao Grace Gospel Church of Christ' },
            {
                time: '8:00 AM', title: 'Lecture 3: Being Part of the Body of Christ',
                details: [{ label: 'Lecturers', items: ['Ages 13–15: Ptr. Vasquez', 'Ages 16–18: Ptr. Bitadora', 'Ages 19 and up: Ptr. Josue Taduran'] }],
            },
            { time: '9:00 AM', title: 'Snacks' },
            { time: '9:30 AM', title: 'Special Lecture: Love, Courtship, and Marriage', by: 'Ptr. Joel Bruzo' },
            { time: '10:30 AM', title: 'Bible Games & Team Games' },
            { time: '11:30 AM', title: 'Lunch and Siesta' },
            { time: '1:00 PM', title: 'Praise and Worship', by: 'Garchitorena Grace Gospel Church of Christ' },
            { time: '1:15 PM', title: 'Preaching, Song Composition, & Music Video Competition' },
            { time: '4:00 PM', title: 'Recollection Booth' },
            { time: '5:00 PM', title: 'Personal Preparation' },
            { time: '6:00 PM', title: 'Dinner' },
            { time: '6:45 PM', title: 'Praise and Worship', by: 'Bicol Grace Gospel Fellowship' },
            {
                time: '7:00 PM', title: 'Vesper', by: 'Ptr. Jephriel Condrillon',
                details: VESPER('Ptr. Jephriel Condrillon', 'Domingo Belmonte', 'Psalms 96:1-9', 'Ptr. Levi Seva',
                    'I Love to Tell the Story', 'Daraga Grace Gospel Church of Christ', 'Acts 20:35',
                    'Adiangao Grace Gospel Church of Christ', 'Ptr. Josue Taduran', 'Blessed Assurance'),
            },
            { time: '8:00 PM', title: 'Bible Quiz, Memory Verse and Choir' },
            { time: '9:30 PM', title: 'Commitment Night', highlight: true },
            { time: '10:30 PM', title: 'Sit Beside and Fellowship' },
            { time: '12:00 AM', title: 'Lights Off' },
        ],
    },
    {
        day: 'Day 4',
        date: 'Wed, Dec 30',
        items: [
            { time: '7:00 AM', title: 'Wake Up Time and Devotion', by: 'Per quarter' },
            { time: '7:30 AM', title: 'Personal Preparation and Breakfast' },
            { time: '8:15 AM', title: 'Praise and Worship', by: 'BGYO Officers' },
            {
                time: '8:30 AM', title: 'Divine Service', by: 'Rev. Sonjhail Deguiñon',
                details: [
                    'Speaker: Rev. Sonjhail Deguiñon',
                    'Leader: SP. Hener Mahinay',
                    'Prelude',
                    'Call to Worship: John 4:23-24',
                    'Opening Prayer: Ptr. Kenneth Rosero',
                    'Opening Hymn: Wonderful Grace of Jesus',
                    'Special Number: 1st Place Choir',
                    'Message: Rev. Sonjhail Deguiñon',
                    "Giver's Text: 2 Corinthians 8:9, 11:12",
                    'Offertory Number: 1st Place Solo',
                    'Offertory Prayer: Ptr. Jephriel Condrillon',
                    'Closing Hymn: When We All Get to Heaven',
                    'Closing Prayer and Benediction: Speaker',
                ],
            },
            { time: '9:30 AM', title: 'Business Meeting & Snacks' },
            { time: '11:00 AM', title: 'Awarding' },
            { time: '11:30 AM', title: 'Lunch and Departure' },
        ],
    },
];
