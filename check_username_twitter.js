const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const readline = require('readline');
const { createInterface } = readline;

// Define the target folder name in the parent directory
const scrap_leads_name = 'scrap_leads';
const data_name = 'data';

// Get the current directory of the script
const current_directory = __dirname;

// Construct the path to the parent folder
const scrap_leads_path = path.resolve(current_directory, '..', scrap_leads_name);
const data_path = path.resolve(current_directory, '..', data_name);

if (!fs.existsSync(scrap_leads_path)) {
    console.log(`The parent folder path ${scrap_leads_path} does not exist`);
}

if (!fs.existsSync(data_path)) {
    console.log(`The parent folder path ${data_path} does not exist`);
}

// Function to check if a Twitter username exists using Puppeteer
async function checkTwitterUsername(username) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = `https://twitter.com/${username}`;

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        const textContent = await page.evaluate(() => {
            const element = document.querySelector('div[data-testid="empty_state_header_text"]');
            return element ? element.textContent : null;
        });

        if (textContent && textContent.includes("This account doesn’t exist")) {
            return [false, `User ${username} does not exist.`];
        } else {
            return [true, `User ${username} exists.`];
        }
    } catch (e) {
        return [false, "Error"];
    } finally {
        await browser.close();
    }
}

function moveUsersExist(username, profileLink, avatarLink) {
    const exist_file_path = path.join(data_path, 'exist_users_TWITTER.json');
    
    if (!fs.existsSync(exist_file_path)) {
        fs.writeFileSync(exist_file_path, JSON.stringify([]));
    }

    const data = JSON.parse(fs.readFileSync(exist_file_path, 'utf8'));

    const userExists = data.some(user => user.username === username);

    if (!userExists) {
        const userEntry = {
            username: username,
            profileLink: profileLink,
            avatar: avatarLink
        };
        data.push(userEntry);
    }

    fs.writeFileSync(exist_file_path, JSON.stringify(data, null, 4));
}

function moveUsersDoesNotExist(username, profileLink, avatarLink) {
    const does_not_exist_file_path = path.join(data_path, 'does_not_exist_users_TWITTER.json');

    if (!fs.existsSync(does_not_exist_file_path)) {
        fs.writeFileSync(does_not_exist_file_path, JSON.stringify([]));
    }

    const data = JSON.parse(fs.readFileSync(does_not_exist_file_path, 'utf8'));

    const userExists = data.some(user => user.username === username);

    if (!userExists) {
        const userEntry = {
            username: username,
            profileLink: profileLink,
            avatar: avatarLink
        };
        data.push(userEntry);
    }

    fs.writeFileSync(does_not_exist_file_path, JSON.stringify(data, null, 4));
}

async function mainChecker(file_path, num_users) {

    console.log(`Checking ${num_users} users...`);

    console.log(`Reading file ${file_path}...`);


    const data = JSON.parse(fs.readFileSync(file_path, 'utf8'));

    const asked_users = num_users;



    const exist_file_path = path.join(data_path, 'exist_users_TWITTER.json');
    const does_not_exist_file_path = path.join(data_path, 'does_not_exist_users_TWITTER.json');

    if (!fs.existsSync(exist_file_path)) {
        fs.writeFileSync(exist_file_path, JSON.stringify([]));
    }

    if (!fs.existsSync(does_not_exist_file_path)) {
        fs.writeFileSync(does_not_exist_file_path, JSON.stringify([]));
    }

    const exist_data = new Set(JSON.parse(fs.readFileSync(exist_file_path, 'utf8')).map(user => user.username));
    const does_not_exist_data = new Set(JSON.parse(fs.readFileSync(does_not_exist_file_path, 'utf8')).map(user => user.username));

    let nb_users_ok = 0;
    let nb_users_not_ok = 0;

    for (const entry of data) {
        const members = entry.members || [];
        for (const member of members) {
            const { username, profileLink, avatar } = member;

            if (exist_data.has(username) || does_not_exist_data.has(username)) {
                console.log(`🆗 User ${username} has already been checked.`);
                continue;
            }

            console.log(`🔁 Checking user ${username}...`);
            let [exists, message] = await checkTwitterUsername(username);
            if (message === 'Error') {
                console.log(`Error checking user ${username}, retrying...`);
                [exists, message] = await checkTwitterUsername(username);
                if (message === 'Error') {
                    console.log(`Error checking user ${username}, skipping...`);
                    continue;
                }
            }

            if (exists) {
                nb_users_ok += 1;
                console.log(`✅ ${username} exists`);
                moveUsersExist(username, profileLink, avatar);
                exist_data.add(username);
            } else {
                nb_users_not_ok += 1;
                console.log(`❌ ${username} does not exist`);
                moveUsersDoesNotExist(username, profileLink, avatar);
                does_not_exist_data.add(username);
            }

            num_users -= 1;
            if (num_users === 0) {
                break;
            }
        }
        if (num_users === 0) {
            break;
        }
    }

    console.log(`Done checking ${asked_users} users. ${nb_users_ok} users exist and ${nb_users_not_ok} users do not exist.`);
    console.log("\n\nReport:");
    console.log(`✅ Percentage of users that exist: ${(nb_users_ok / asked_users * 100).toFixed(2)}%`);
    console.log(`❌ Percentage of users that do not exist: ${(nb_users_not_ok / asked_users * 100).toFixed(2)}%`);
}


function finalReport() {
    if (!fs.existsSync(path.join(data_path, 'exist_users_TWITTER.json'))) {
        fs.writeFileSync(path.join(data_path, 'exist_users_TWITTER.json'), JSON.stringify([]));
    }
    if (!fs.existsSync(path.join(data_path, 'does_not_exist_users_TWITTER.json'))) {
        fs.writeFileSync(path.join(data_path, 'does_not_exist_users_TWITTER.json'), JSON.stringify([]));
    }

    const exist_data = JSON.parse(fs.readFileSync(path.join(data_path, 'exist_users_TWITTER.json'), 'utf8'));
    const does_not_exist_data = JSON.parse(fs.readFileSync(path.join(data_path, 'does_not_exist_users_TWITTER.json'), 'utf8'));

    console.log("\n\nFinal Report:");
    console.log(`Total Checked: ${exist_data.length + does_not_exist_data.length}`);

    let total_users_checked = 0;
    ['onlineData_BLB_full.json', 'onlineData_SUNRISE_full.json', 'onlineData_Sphere.json'].forEach(file => {
        const data = JSON.parse(fs.readFileSync(path.join(scrap_leads_path, file), 'utf8'));
        data.forEach(entry => {
            total_users_checked += (entry.members || []).length;
        });
    });

    const percent_checked = ((exist_data.length + does_not_exist_data.length) / total_users_checked * 100).toFixed(2);
    console.log(`Total Users: ${total_users_checked}`);
    console.log(`Users Checked: ${exist_data.length + does_not_exist_data.length} || Percentage Checked: ${percent_checked}%`);

    console.log("\n________________________________");
    console.log(`✅ Existing Users: ${exist_data.length} || ❌ Non-existent Users: ${does_not_exist_data.length}`);
    console.log("________________________________");

    if (exist_data.length + does_not_exist_data.length === 0) {
        console.log("No users found");
        return;
    }

    const percent_exist = ((exist_data.length / (exist_data.length + does_not_exist_data.length)) * 100).toFixed(2);
    console.log("\n________________________________");
    console.log(`Percentage:\n`);
    console.log(`✅ Exist: ${percent_exist}%  ❌ Does not exist: ${(100 - percent_exist).toFixed(2)}%`);
    console.log("________________________________");
}


// main that calls finalReport first and then asks if you want to check users
finalReport();

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Do you want to check users? (y/n): ", (check_users) => {
    if (check_users === 'y') {
        rl.question("Enter the number of the file you want to check:\n1. onlineData_BLB_full.json\n2. onlineData_SUNRISE_full.json\n3. onlineData_Sphere.json\n", (file_path) => {
            let file = '';
            if (file_path === '1') {
                file = "onlineData_BLB_full.json";
            } else if (file_path === '2') {
                file = "onlineData_SUNRISE_full.json";
            } else if (file_path === '3') {
                file = "onlineData_Sphere.json";
            } else {
                console.log("Please enter a valid choice.");
                rl.close();
                return;
            }
            const file_path_good = path.join(scrap_leads_path, file);
            if (!fs.existsSync(file_path_good)) {
                console.log(`The file ${file_path_good} does not exist.`);
                rl.close();
                return;
            }
            console.log(`Checking file ${file_path_good}...`);
            
            // Ask for the number of users to check
            rl.question("Enter the number of users you want to check: ", (nb_users) => {
                try {
                    let num_users = parseInt(nb_users);
                    if (isNaN(num_users) || num_users <= 0) {
                        console.log("Please enter a valid number greater than 0.");
                        rl.close();
                        return;
                    }
                    rl.close();
                    mainChecker(file_path_good, num_users);
                } catch (e) {
                    console.log("Please enter a valid number.");
                    rl.close();
                }
            });
        });
    } else {
        console.log("Exiting...");
        process.exit();
        rl.close();
    }
});

