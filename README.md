# Node.js Twitter Username Checker

## Description

This Node.js script checks if Twitter usernames exist using Puppeteer, and organizes the results into JSON files. The script reads usernames from specified JSON files, checks their existence on Twitter, and then categorizes them into files of existing and non-existing users.

## Features

- **Check Twitter Usernames:** Uses Puppeteer to visit Twitter profiles and check if they exist.
- **Organize Results:** Categorizes and saves results into `exist_users_TWITTER.json` and `does_not_exist_users_TWITTER.json`.
- **Interactive User Input:** Prompts users to select files and number of usernames to check.

## Prerequisites

- Node.js installed on your machine.
- `puppeteer` and other required packages installed via npm.

## Installation

1. Clone the repository or download the script file.
2. Navigate to the script directory and install dependencies:

    ```bash
    npm install puppeteer
    ```

## Script Structure

### Constants and Paths

- **scrap_leads_name:** Name of the target folder for scraping leads.
- **data_name:** Name of the data folder.
- **current_directory:** Directory of the script.
- **scrap_leads_path:** Path to the parent folder for scraping leads.
- **data_path:** Path to the data folder.

### Functions

#### `checkTwitterUsername(username)`

Checks if a Twitter username exists using Puppeteer.

#### `moveUsersExist(username, profileLink, avatarLink)`

Moves existing users to `exist_users_TWITTER.json`.

#### `moveUsersDoesNotExist(username, profileLink, avatarLink)`

Moves non-existing users to `does_not_exist_users_TWITTER.json`.

#### `mainChecker(file_path, num_users)`

Main function to check usernames from the specified file and number of users.

#### `finalReport()`

Generates and displays the final report of the check results.

## Usage

1. **Initial Setup:**
   Ensure the directories `scrap_leads` and `data` exist in the parent directory of the script.

2. **Run the Script:**
   ```bash
   node <script_name>.js
   ```

3. **Follow Prompts:**
   - The script will generate an initial report.
   - When prompted, choose whether to check users.
   - If 'y', select the file to check:
     1. `onlineData_BLB_full.json`
     2. `onlineData_SUNRISE_full.json`
     3. `onlineData_Sphere.json`
   - Enter the number of users you want to check.

## Example

```bash
node twitterChecker.js
```

### Example Interaction

1. Script generates an initial report.
2. Prompt: `Do you want to check users? (y/n):`
   - Enter 'y' to check users.
3. Prompt: `Enter the number of the file you want to check:`
   - Enter '1' for `onlineData_BLB_full.json`.
4. Prompt: `Enter the number of users you want to check:`
   - Enter the number of users to check (e.g., `10`).

## Output

- The results of the checks are saved in `data/exist_users_TWITTER.json` and `data/does_not_exist_users_TWITTER.json`.
- The script outputs the final report with the number of users checked and their statuses.

## Notes

- Ensure the required JSON files (e.g., `onlineData_BLB_full.json`, `onlineData_SUNRISE_full.json`, `onlineData_Sphere.json`) are present in the `scrap_leads` folder.
- Modify the script paths and file names as necessary to fit your directory structure and file naming conventions.

## License

This project is licensed under the MIT License.

---

This README provides a comprehensive guide to understanding and using the Twitter username checker script. Modify the paths and constants as needed to fit your project structure.
