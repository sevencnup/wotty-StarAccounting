import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const Client = require('ssh2-sftp-client');
const { Client: SSHClient } = require('ssh2');
const dotenv = require('dotenv');

// Load environment variables from .env file in root
dotenv.config({ path: resolve(__dirname, '../.env') });

const config = require('../deploy-config.json');
const sftp = new Client();

async function executeRemoteCommand(cmd, sshConfig) {
    return new Promise((resolve, reject) => {
        const conn = new SSHClient();
        conn.on('ready', () => {
            console.log(`\n\x1b[36m%s\x1b[0m`, `Executing remote command...`);
            conn.exec(cmd, (err, stream) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }

                stream.on('close', (code, signal) => {
                    conn.end();
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Command failed with code ${code}`));
                    }
                }).on('data', (data) => {
                    process.stdout.write(data);
                }).stderr.on('data', (data) => {
                    process.stderr.write(data);
                });
            });
        }).on('error', (err) => {
            reject(err);
        }).connect(sshConfig);
    });
}

async function uploadDirRecursive(sftp, localPath, remotePath) {
    const stats = fs.statSync(localPath);

    if (stats.isDirectory()) {
        try {
            await sftp.mkdir(remotePath, true);
        } catch (e) {
            // Directory might already exist
        }

        const items = fs.readdirSync(localPath);
        for (const item of items) {
            const localItemPath = resolve(localPath, item);
            const remoteItemPath = `${remotePath}/${item}`;
            await uploadDirRecursive(sftp, localItemPath, remoteItemPath);
        }
    } else {
        await sftp.put(localPath, remotePath);
    }
}

async function deploy() {
    const password = process.env.DEPLOY_PASSWORD;
    if (!password || password === 'your_server_password_here') {
        console.error('\x1b[31m%s\x1b[0m', 'Error: Invalid DEPLOY_PASSWORD in .env file');
        console.log('Please create .env file with DEPLOY_PASSWORD=your_password');
        process.exit(1);
    }

    // Check if build outputs exist
    const serverDist = resolve(__dirname, '../server/dist');
    const webOut = resolve(__dirname, '../web/out');

    if (!fs.existsSync(serverDist)) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: server/dist not found!');
        console.log('Please run "npm run build:server" first.');
        process.exit(1);
    }

    if (!fs.existsSync(webOut)) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: web/out not found!');
        console.log('Please run "npm run build:web" first.');
        process.exit(1);
    }

    const sshConfig = {
        host: config.server.host,
        port: config.server.port,
        username: config.server.username,
        password: password
    };

    try {
        console.log('\x1b[36m%s\x1b[0m', 'Connecting to server (SFTP)...');
        await sftp.connect(sshConfig);
        console.log('\x1b[32m%s\x1b[0m', 'Connected!');

        for (const target of config.deployTargets) {
            const localPath = resolve(__dirname, '..', target.localPath);
            const remotePath = target.remotePath;

            console.log(`\nDeploying ${target.name}...`);
            console.log(`  Local: ${localPath}`);
            console.log(`  Remote: ${remotePath}`);

            if (!fs.existsSync(localPath)) {
                console.warn(`\x1b[33m%s\x1b[0m`, `Warning: Local path does not exist: ${localPath}`);
                continue;
            }

            if (target.type === 'directory') {
                try {
                    await sftp.rmdir(remotePath, true);
                } catch (e) {
                    // Directory might not exist
                }
                await uploadDirRecursive(sftp, localPath, remotePath);
            } else {
                const remoteDir = dirname(remotePath);
                try {
                    await sftp.mkdir(remoteDir, true);
                } catch (e) {
                    // Ignore
                }
                await sftp.put(localPath, remotePath);
            }
            console.log(`\x1b[32m%s\x1b[0m`, `✓ ${target.name} deployed`);
        }

        console.log('\n\x1b[32m%s\x1b[0m', 'Files uploaded successfully!');

        // Install dependencies and restart services on server
        console.log('\n\x1b[36m%s\x1b[0m', 'Installing dependencies and restarting services...');

        const serverDir = `${config.server.appDir}/server`;
        const webDir = `${config.server.appDir}/web`;

        const deployCmd = `
            echo "------------------------------------------------"
            echo "Remote Deploy Script"
            echo "------------------------------------------------"
            set -e

            # Load environment variables
            [ -f ~/.bashrc ] && source ~/.bashrc
            [ -f ~/.bash_profile ] && source ~/.bash_profile
            [ -f ~/.profile ] && source ~/.profile

            APP_DIR="${config.server.appDir}"
            SERVER_DIR="${serverDir}"
            WEB_DIR="${webDir}"

            version_gte() {
                [ "$1" = "$(printf '%s\n%s\n' "$1" "$2" | sort -V | tail -n 1)" ]
            }

            try_node_candidate() {
                local candidate="$1"
                local version=""

                [ -n "$candidate" ] || return 1
                [ -x "$candidate" ] || return 1

                version=$("$candidate" -v 2>/dev/null | sed 's/^v//')
                [ -n "$version" ] || return 1

                if version_gte "$version" "$REQUIRED_NODE"; then
                    NODE_BIN="$candidate"
                    NODE_VERSION="$version"
                    return 0
                fi

                return 1
            }

            # Validate deploy directories
            cd "$APP_DIR" || { echo "Error: Cannot cd to $APP_DIR"; exit 1; }
            [ -d "$SERVER_DIR" ] || { echo "Error: Missing server directory: $SERVER_DIR"; exit 1; }
            [ -d "$WEB_DIR" ] || { echo "Error: Missing web directory: $WEB_DIR"; exit 1; }
            [ -f "$WEB_DIR/index.html" ] || { echo "Error: Missing web/index.html after upload"; exit 1; }

            echo "Checking Node.js runtime..."
            REQUIRED_NODE="18.18.0"
            NODE_BIN=""
            NODE_VERSION=""
            CURRENT_NODE_PATH=$(command -v node 2>/dev/null || true)
            CURRENT_NODE_VERSION="not found"

            if [ -n "$CURRENT_NODE_PATH" ] && [ -x "$CURRENT_NODE_PATH" ]; then
                CURRENT_NODE_VERSION=$("$CURRENT_NODE_PATH" -v 2>/dev/null || echo "unknown")
                try_node_candidate "$CURRENT_NODE_PATH" || true
            fi

            if [ -z "$NODE_BIN" ]; then
                for candidate in /usr/local/bin/node /usr/bin/node /opt/node/bin/node; do
                    try_node_candidate "$candidate" && break
                done
            fi

            if [ -z "$NODE_BIN" ] && [ -d "$HOME/.nvm/versions/node" ]; then
                while IFS= read -r candidate; do
                    try_node_candidate "$candidate" && break
                done <<EOF
$(find "$HOME/.nvm/versions/node" -path "*/bin/node" -type f 2>/dev/null | sort -V -r)
EOF
            fi

            if [ -z "$NODE_BIN" ] && [ -d "/www/server/nodejs" ]; then
                while IFS= read -r candidate; do
                    try_node_candidate "$candidate" && break
                done <<EOF
$(find /www/server/nodejs -path "*/bin/node" -type f 2>/dev/null | sort -V -r)
EOF
            fi

            if [ -z "$NODE_BIN" ]; then
                echo "Error: Could not find Node.js >= \${REQUIRED_NODE}. Default node from PATH: \${CURRENT_NODE_PATH:-not found} (\${CURRENT_NODE_VERSION})"
                exit 1
            fi

            export PATH="$(dirname "$NODE_BIN"):$PATH"
            hash -r

            echo "Default node from PATH: \${CURRENT_NODE_PATH:-not found} (\${CURRENT_NODE_VERSION})"
            echo "Using Node.js: $NODE_BIN ($(node -v))"

            if ! command -v npm >/dev/null 2>&1; then
                echo "Error: npm command not found for selected Node.js runtime"
                exit 1
            fi
            echo "Using npm: $(command -v npm) ($(npm -v))"

            echo "Installing server dependencies..."
            cd "$SERVER_DIR"
            npm install --omit=dev

            echo "Fixing static file permissions..."
            chmod 755 "$APP_DIR" "$WEB_DIR" || true
            find "$WEB_DIR" -type d -exec chmod 755 {} \\;
            find "$WEB_DIR" -type f -exec chmod 644 {} \\;

            echo "------------------------------------------------"
            echo "Finding PM2..."
            PM2_PATH=""

            if command -v pm2 >/dev/null 2>&1; then
                PM2_PATH=$(command -v pm2)
            fi

            if [ -z "$PM2_PATH" ]; then
                BT_PM2=$(find /www/server/nodejs -name pm2 -type f -path "*/bin/pm2" 2>/dev/null | sort -r | head -n 1)
                if [ -n "$BT_PM2" ]; then
                    PM2_PATH="$BT_PM2"
                    export PATH=$PATH:$(dirname "$BT_PM2")
                fi
            fi

            if [ -z "$PM2_PATH" ]; then
                if [ -f "/usr/local/bin/pm2" ]; then PM2_PATH="/usr/local/bin/pm2"; fi
                if [ -f "/opt/node/bin/pm2" ]; then PM2_PATH="/opt/node/bin/pm2"; fi
            fi

            if [ -z "$PM2_PATH" ]; then
                PM2_PATH="pm2"
            fi

            echo "Using PM2: $PM2_PATH"
            echo "------------------------------------------------"

            # Restart server process
            echo "Restarting server..."
            cd "$SERVER_DIR"
            $PM2_PATH delete ${config.process.serverName} 2>/dev/null || true
            $PM2_PATH start "$SERVER_DIR/src/main.js" --name ${config.process.serverName} || $PM2_PATH restart ${config.process.serverName}
            $PM2_PATH save

            echo "------------------------------------------------"
            echo "Deployment completed!"
            echo "------------------------------------------------"
        `;

        await executeRemoteCommand(deployCmd, sshConfig);
        console.log('\n\x1b[32m%s\x1b[0m', 'Deployment completed successfully!');

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', 'Deployment failed:', err.message);
        process.exit(1);
    } finally {
        await sftp.end();
    }
}

deploy();
