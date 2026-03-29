[
    {
        "id": "d194cc9a6cbe9111",
        "type": "tab",
        "label": "OpenSesame Add Button",
        "disabled": false,
        "info": ""
    },
    {
        "id": "22ce8cb6cfe87209",
        "type": "ui-text-input",
        "z": "d194cc9a6cbe9111",
        "group": "0e326d1962a40c08",
        "name": "Company Input",
        "label": "Company name",
        "order": 1,
        "width": 6,
        "height": 1,
        "topic": "company",
        "topicType": "str",
        "mode": "text",
        "tooltip": "",
        "delay": 0,
        "passthru": true,
        "sendOnDelay": false,
        "sendOnBlur": true,
        "sendOnEnter": true,
        "className": "",
        "clearable": true,
        "sendOnClear": false,
        "icon": "",
        "iconPosition": "left",
        "iconInnerPosition": "inside",
        "x": 840,
        "y": 440,
        "wires": [
            [
                "89641ab389d1ef08"
            ]
        ]
    },
    {
        "id": "5456efdccc5514bf",
        "type": "ui-template",
        "z": "d194cc9a6cbe9111",
        "group": "0e326d1962a40c08",
        "page": "",
        "ui": "",
        "name": "Generated Code Display",
        "order": 2,
        "width": 3,
        "height": 1,
        "head": "",
        "format": "<template><div style=\"font-size:1.1rem;font-weight:600;\">Code: <span style=\"font-family:monospace;\">{{ code || '-' }}</span></div></template><script>export default {data(){return {code:''}},mounted(){this.$socket.on('msg-input:' + this.id,(msg)=>{this.code=(msg.payload||'').toString();});}}</script>",
        "storeOutMessages": false,
        "passthru": false,
        "resendOnRefresh": true,
        "templateScope": "local",
        "className": "",
        "x": 1040,
        "y": 180,
        "wires": [
            []
        ]
    },
    {
        "id": "89641ab389d1ef08",
        "type": "function",
        "z": "d194cc9a6cbe9111",
        "name": "Add company + generate code",
        "func": "const ARCHIVE_DIR = '/opensesameArchives';\nconst STATE_FILE = path.join(ARCHIVE_DIR, 'opensesameState.txt');\nconst CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';\nconst CODE_LEN = 6;\n\nfunction loadState() {\n    try {\n        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n        if (!fs.existsSync(STATE_FILE)) {\n            return [];\n        }\n\n        const raw = fs.readFileSync(STATE_FILE, 'utf8').trim();\n        if (!raw) {\n            return [];\n        }\n\n        const parsed = JSON.parse(raw);\n        return Array.isArray(parsed) ? parsed : [];\n    } catch (err) {\n        node.warn(`Unable to load state file ${STATE_FILE}: ${err.message}`);\n        return [];\n    }\n}\n\nfunction saveState(table) {\n    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n    const tempFile = `${STATE_FILE}.tmp`;\n    fs.writeFileSync(tempFile, `${JSON.stringify(table)}\\n`, 'utf8');\n    fs.renameSync(tempFile, STATE_FILE);\n}\n\nfunction hash32(str, seed) {\n    let hash = (2166136261 ^ seed) >>> 0;\n    for (let index = 0; index < str.length; index++) {\n        hash ^= str.charCodeAt(index);\n        hash = Math.imul(hash, 16777619) >>> 0;\n    }\n    return hash >>> 0;\n}\n\nfunction makeCode(name, salt) {\n    let output = '';\n    for (let index = 0; index < CODE_LEN; index++) {\n        const hash = hash32(`${name}|${salt}|${index}`, 0x9e3779b9 + index);\n        output += CHARSET[hash % CHARSET.length];\n    }\n    return output;\n}\n\nconst companyName = (msg.payload || '').toString().trim();\nif (!companyName) return null;\n\nlet table = flow.get('tableData');\nif (!Array.isArray(table)) {\n    table = loadState();\n}\n\nconst used = new Set(table.map((row) => row.code));\n\nlet code = '';\nlet salt = 0;\ndo {\n    code = makeCode(companyName, salt++);\n} while (used.has(code) && salt < 100000);\n\nif (used.has(code)) return null;\n\ntable.push({\n    id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,\n    companyName,\n    code,\n    event: '',\n    timestamp: '',\n    createdAt: new Date().toISOString()\n});\n\nflow.set('tableData', table);\n\ntry {\n    saveState(table);\n} catch (err) {\n    node.error(`Unable to persist table state: ${err.message}`, msg);\n    return null;\n}\n\nreturn [\n    { payload: '', meta: 'populate' },\n    { payload: code },\n    { payload: table }\n];",
        "outputs": 3,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [
            {
                "var": "fs",
                "module": "fs"
            },
            {
                "var": "path",
                "module": "path"
            }
        ],
        "x": 610,
        "y": 180,
        "wires": [
            [
                "22ce8cb6cfe87209"
            ],
            [
                "5456efdccc5514bf"
            ],
            [
                "99c18de7dbdc5854"
            ]
        ]
    },
    {
        "id": "230dfe9265182634",
        "type": "mqtt in",
        "z": "d194cc9a6cbe9111",
        "name": "MQTT Incoming Codes",
        "topic": "company/code",
        "qos": "2",
        "datatype": "auto-detect",
        "broker": "mqtt_broker_btn",
        "nl": false,
        "rap": false,
        "inputs": 0,
        "x": 210,
        "y": 320,
        "wires": [
            [
                "a103e9fadc6dcf44",
                "b017ce0e2b81e644"
            ]
        ]
    },
    {
        "id": "a103e9fadc6dcf44",
        "type": "function",
        "z": "d194cc9a6cbe9111",
        "name": "Mark code used (MQTT)",
        "func": "const ARCHIVE_DIR = '/opensesameArchives';\nconst STATE_FILE = path.join(ARCHIVE_DIR, 'opensesameState.txt');\n\nfunction loadState() {\n    try {\n        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n        if (!fs.existsSync(STATE_FILE)) {\n            return [];\n        }\n\n        const raw = fs.readFileSync(STATE_FILE, 'utf8').trim();\n        if (!raw) {\n            return [];\n        }\n\n        const parsed = JSON.parse(raw);\n        return Array.isArray(parsed) ? parsed : [];\n    } catch (err) {\n        node.warn(`Unable to load state file ${STATE_FILE}: ${err.message}`);\n        return [];\n    }\n}\n\nfunction saveState(table) {\n    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n    const tempFile = `${STATE_FILE}.tmp`;\n    fs.writeFileSync(tempFile, `${JSON.stringify(table)}\\n`, 'utf8');\n    fs.renameSync(tempFile, STATE_FILE);\n}\n\nconst incoming = (msg.payload || '').toString().trim();\nif (!incoming) return null;\n\nlet table = flow.get('tableData');\nif (!Array.isArray(table)) {\n    table = loadState();\n}\n\nlet matched = false;\nconst now = new Date().toISOString();\nfor (const row of table) {\n    if (row.code === incoming) {\n        row.event = '✓';\n        row.timestamp = now;\n        matched = true;\n        break;\n    }\n}\n\nflow.set('tableData', table);\n\ntry {\n    saveState(table);\n} catch (err) {\n    node.error(`Unable to persist used-code update: ${err.message}`, msg);\n    return null;\n}\n\nconst tableMsg = { payload: table };\nconst shellyMsg = matched ? { payload: 'ON' } : null;\nreturn [tableMsg, shellyMsg];",
        "outputs": 2,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [
            {
                "var": "fs",
                "module": "fs"
            },
            {
                "var": "path",
                "module": "path"
            }
        ],
        "x": 500,
        "y": 320,
        "wires": [
            [
                "99c18de7dbdc5854"
            ],
            [
                "5b6d94f181c29b8c"
            ]
        ]
    },
    {
        "id": "5b6d94f181c29b8c",
        "type": "mqtt out",
        "z": "d194cc9a6cbe9111",
        "name": "Shelly switch command",
        "topic": "cmnd/opensesame/POWER1",
        "qos": "0",
        "retain": "false",
        "respTopic": "",
        "contentType": "",
        "userProps": "",
        "correl": "",
        "expiry": "",
        "broker": "mqtt_broker_btn",
        "x": 1060,
        "y": 240,
        "wires": []
    },
    {
        "id": "99c18de7dbdc5854",
        "type": "ui-template",
        "z": "d194cc9a6cbe9111",
        "group": "5c659a57bccefd2e",
        "page": "",
        "ui": "",
        "name": "Interactive Table",
        "order": 1,
        "width": 12,
        "height": 0,
        "head": "",
        "format": "<template>\n  <div>\n    <div v-if=\"confirmRow\" style=\"position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;\">\n      <div style=\"background:#fff;padding:16px;border-radius:8px;min-width:300px;\">\n        <div style=\"margin-bottom:12px;\">Delete <b>{{ confirmRow.companyName }}</b>?</div>\n        <button @click=\"doDelete\" style=\"margin-right:8px;\">Delete</button>\n        <button @click=\"confirmRow=null\">Cancel</button>\n      </div>\n    </div>\n\n    <table style=\"width:100%;border-collapse:collapse;\">\n      <thead>\n        <tr style=\"background:#1f6feb;color:#fff;\">\n          <th style=\"text-align:left;padding:6px;\">Company Name</th>\n          <th style=\"text-align:left;padding:6px;\">Code</th>\n          <th style=\"text-align:center;padding:6px;\">Used</th>\n          <th style=\"text-align:left;padding:6px;\">Timestamp</th>\n          <th style=\"text-align:center;padding:6px;\">🗑</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr v-for=\"row in rows\" :key=\"row.id\">\n          <td style=\"padding:6px;border-bottom:1px solid #ddd;\">{{ row.companyName }}</td>\n          <td style=\"padding:6px;border-bottom:1px solid #ddd;font-family:monospace;\">{{ row.code }}</td>\n          <td style=\"padding:6px;border-bottom:1px solid #ddd;text-align:center;\">{{ row.event }}</td>\n          <td style=\"padding:6px;border-bottom:1px solid #ddd;\">{{ row.timestamp }}</td>\n          <td style=\"padding:6px;border-bottom:1px solid #ddd;text-align:center;cursor:pointer;\" @click.stop=\"askDelete(row)\">🗑</td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</template>\n\n<script>\nexport default {\n  data(){ return { rows: [], confirmRow: null }; },\n  mounted(){\n    this.$socket.on('msg-input:' + this.id, (msg) => {\n      if (Array.isArray(msg.payload)) this.rows = msg.payload;\n    });\n\n    // Ask backend for current table whenever this widget mounts (page refresh/open).\n    this.send({ action: 'requestTable' });\n  },\n  methods:{\n    askDelete(row){ this.confirmRow = row; },\n    doDelete(){\n      this.send({ action: 'deleteConfirmed', rowId: this.confirmRow.id });\n      this.confirmRow = null;\n    }\n  }\n}\n</script>",
        "storeOutMessages": true,
        "passthru": true,
        "resendOnRefresh": true,
        "templateScope": "local",
        "className": "",
        "x": 1010,
        "y": 320,
        "wires": [
            [
                "c1631763d8a053f8"
            ]
        ]
    },
    {
        "id": "c1631763d8a053f8",
        "type": "function",
        "z": "d194cc9a6cbe9111",
        "name": "Handle delete action",
        "func": "const ARCHIVE_DIR = '/opensesameArchives';\nconst STATE_FILE = path.join(ARCHIVE_DIR, 'opensesameState.txt');\n\nfunction loadState() {\n    try {\n        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n        if (!fs.existsSync(STATE_FILE)) {\n            return [];\n        }\n\n        const raw = fs.readFileSync(STATE_FILE, 'utf8').trim();\n        if (!raw) {\n            return [];\n        }\n\n        const parsed = JSON.parse(raw);\n        return Array.isArray(parsed) ? parsed : [];\n    } catch (err) {\n        node.warn(`Unable to load state file ${STATE_FILE}: ${err.message}`);\n        return [];\n    }\n}\n\nfunction saveState(table) {\n    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n    const tempFile = `${STATE_FILE}.tmp`;\n    fs.writeFileSync(tempFile, `${JSON.stringify(table)}\\n`, 'utf8');\n    fs.renameSync(tempFile, STATE_FILE);\n}\n\nlet table = flow.get('tableData');\nif (!Array.isArray(table)) {\n    table = loadState();\n    flow.set('tableData', table);\n}\n\nif (msg.action === 'requestTable') {\n    msg.payload = table;\n    return msg;\n}\n\nif (msg.action !== 'deleteConfirmed') return null;\n\nconst rowId = msg.rowId;\ntable = table.filter((row) => row.id !== rowId);\nflow.set('tableData', table);\n\ntry {\n    saveState(table);\n} catch (err) {\n    node.error(`Unable to persist delete action: ${err.message}`, msg);\n    return null;\n}\n\nmsg.payload = table;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "libs": [
            {
                "var": "fs",
                "module": "fs"
            },
            {
                "var": "path",
                "module": "path"
            }
        ],
        "x": 1180,
        "y": 440,
        "wires": [
            [
                "99c18de7dbdc5854"
            ]
        ]
    },
    {
        "id": "1d39736c2355bf14",
        "type": "inject",
        "z": "d194cc9a6cbe9111",
        "name": "Daily sweep 00:00",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "0 0 * * *",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "str",
        "x": 250,
        "y": 390,
        "wires": [
            [
                "72b9342c0545f337"
            ]
        ]
    },
    {
        "id": "72b9342c0545f337",
        "type": "function",
        "z": "d194cc9a6cbe9111",
        "name": "Daily archive sweep",
        "func": "const ARCHIVE_DIR = '/opensesameArchives';\nconst ARCHIVE_FILE = path.join(ARCHIVE_DIR, 'opensesameArchive.csv');\nconst STATE_FILE = path.join(ARCHIVE_DIR, 'opensesameState.txt');\nconst now = Date.now();\nconst d7 = 7 * 24 * 60 * 60 * 1000;\nconst d60 = 60 * 24 * 60 * 60 * 1000;\n\nfunction saveState(table) {\n    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n    const tempFile = `${STATE_FILE}.tmp`;\n    fs.writeFileSync(tempFile, `${JSON.stringify(table)}\\n`, 'utf8');\n    fs.renameSync(tempFile, STATE_FILE);\n}\n\nfunction esc(value) {\n    const stringValue = (value ?? '').toString();\n    return /[\",\\n]/.test(stringValue) ? `\"${stringValue.replace(/\"/g, '\"\"')}\"` : stringValue;\n}\n\nfunction parseCsvLine(line) {\n    const out = [];\n    let current = '';\n    let quoted = false;\n\n    for (let index = 0; index < line.length; index++) {\n        const char = line[index];\n        if (quoted) {\n            if (char === '\"' && line[index + 1] === '\"') {\n                current += '\"';\n                index++;\n            } else if (char === '\"') {\n                quoted = false;\n            } else {\n                current += char;\n            }\n        } else if (char === '\"') {\n            quoted = true;\n        } else if (char === ',') {\n            out.push(current);\n            current = '';\n        } else {\n            current += char;\n        }\n    }\n\n    out.push(current);\n    return out;\n}\n\nfs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n\nlet table = flow.get('tableData') || [];\nconst aged = table.filter((row) => row.createdAt && (now - new Date(row.createdAt).getTime()) > d7);\nconst fresh = table.filter((row) => !row.createdAt || (now - new Date(row.createdAt).getTime()) <= d7);\nflow.set('tableData', fresh);\n\ntry {\n    saveState(fresh);\n} catch (err) {\n    node.error(`Unable to persist archive sweep state: ${err.message}`, msg);\n    return null;\n}\n\nlet keptRows = [];\nif (fs.existsSync(ARCHIVE_FILE)) {\n    const lines = fs.readFileSync(ARCHIVE_FILE, 'utf8').split('\\n').filter(Boolean);\n    for (const line of lines.slice(1)) {\n        const cols = parseCsvLine(line);\n        const createdAt = cols[4] || cols[3] || '';\n        const timestamp = new Date(createdAt).getTime();\n        if (!createdAt || (Number.isFinite(timestamp) && (now - timestamp) <= d60)) {\n            keptRows.push(cols);\n        }\n    }\n}\n\nconst newRows = aged.map((row) => [row.companyName || '', row.code || '', row.event || '', row.timestamp || '', row.createdAt || '']);\nconst allRows = keptRows.concat(newRows);\nconst header = 'companyName,code,event,timestamp,createdAt';\nconst body = allRows.map((row) => row.map(esc).join(',')).join('\\n');\nfs.writeFileSync(ARCHIVE_FILE, header + (body ? `\\n${body}\\n` : '\\n'), 'utf8');\n\nmsg.payload = fresh;\nreturn msg;",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [
            {
                "var": "fs",
                "module": "fs"
            },
            {
                "var": "path",
                "module": "path"
            }
        ],
        "x": 510,
        "y": 390,
        "wires": [
            [
                "99c18de7dbdc5854"
            ]
        ]
    },
    {
        "id": "056ce7248beec28e",
        "type": "inject",
        "z": "d194cc9a6cbe9111",
        "name": "Init state on deploy",
        "props": [
            {
                "p": "payload"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": true,
        "onceDelay": "0.5",
        "topic": "",
        "payload": "",
        "payloadType": "str",
        "x": 260,
        "y": 460,
        "wires": [
            [
                "a20bba69f575c7db"
            ]
        ]
    },
    {
        "id": "a20bba69f575c7db",
        "type": "function",
        "z": "d194cc9a6cbe9111",
        "name": "Load persisted state",
        "func": "const ARCHIVE_DIR = '/opensesameArchives';\nconst STATE_FILE = path.join(ARCHIVE_DIR, 'opensesameState.txt');\n\nlet table = [];\n\ntry {\n    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });\n    if (fs.existsSync(STATE_FILE)) {\n        const raw = fs.readFileSync(STATE_FILE, 'utf8').trim();\n        if (raw) {\n            const parsed = JSON.parse(raw);\n            if (Array.isArray(parsed)) {\n                table = parsed;\n            }\n        }\n    }\n} catch (err) {\n    node.warn(`Unable to load persisted state from ${STATE_FILE}: ${err.message}`);\n}\n\nflow.set('tableData', table);\n\nreturn [\n  { payload: '', meta: 'populate' },\n  { payload: '' },\n  { payload: table }\n];",
        "outputs": 3,
        "noerr": 0,
        "libs": [
            {
                "var": "fs",
                "module": "fs"
            },
            {
                "var": "path",
                "module": "path"
            }
        ],
        "x": 510,
        "y": 460,
        "wires": [
            [
                "22ce8cb6cfe87209"
            ],
            [
                "5456efdccc5514bf"
            ],
            [
                "99c18de7dbdc5854"
            ]
        ]
    },
    {
        "id": "b017ce0e2b81e644",
        "type": "debug",
        "z": "d194cc9a6cbe9111",
        "name": "debug 4",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 430,
        "y": 280,
        "wires": []
    },
    {
        "id": "02a6fbfbea676c2b",
        "type": "catch",
        "z": "d194cc9a6cbe9111",
        "name": "Catch persistence errors",
        "scope": [
            "89641ab389d1ef08",
            "a103e9fadc6dcf44",
            "c1631763d8a053f8",
            "72b9342c0545f337",
            "a20bba69f575c7db"
        ],
        "uncaught": false,
        "x": 250,
        "y": 540,
        "wires": [
            [
                "2d5d78a05cbe65b7"
            ]
        ]
    },
    {
        "id": "2d5d78a05cbe65b7",
        "type": "function",
        "z": "d194cc9a6cbe9111",
        "name": "Format persistence error",
        "func": "const source = msg.error?.source?.name || msg.error?.source?.id || 'unknown';\nconst errMessage = msg.error?.message || msg.error || 'unknown error';\nconst stack = msg.error?.stack ? ` | ${String(msg.error.stack).split('\\n')[0]}` : '';\n\nmsg.payload = `[Persistence] ${source}: ${errMessage}${stack}`;\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "x": 600,
        "y": 540,
        "wires": [
            [
                "4ff24e58e44c34e2"
            ]
        ]
    },
    {
        "id": "4ff24e58e44c34e2",
        "type": "debug",
        "z": "d194cc9a6cbe9111",
        "name": "Persistence errors",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": true,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "payload",
        "statusType": "msg",
        "x": 910,
        "y": 540,
        "wires": []
    },
    {
        "id": "0e326d1962a40c08",
        "type": "ui-group",
        "name": "Input / Output",
        "page": "56781c0eadb27a50",
        "width": 12,
        "height": 1,
        "order": 1,
        "showTitle": true,
        "className": "",
        "visible": "true",
        "disabled": "false",
        "groupType": "default"
    },
    {
        "id": "mqtt_broker_btn",
        "type": "mqtt-broker",
        "name": "Mosquitto",
        "broker": "192.168.7.245",
        "port": "1883",
        "clientid": "node-red-company-code-app",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": "5",
        "keepalive": "60",
        "cleansession": true,
        "autoUnsubscribe": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthPayload": "",
        "birthMsg": {},
        "closeTopic": "",
        "closeQos": "0",
        "closePayload": "",
        "closeMsg": {},
        "willTopic": "",
        "willQos": "0",
        "willPayload": "",
        "willMsg": {},
        "sessionExpiry": ""
    },
    {
        "id": "5c659a57bccefd2e",
        "type": "ui-group",
        "name": "Codes Table",
        "page": "56781c0eadb27a50",
        "width": 12,
        "height": 1,
        "order": 2,
        "showTitle": true,
        "className": "",
        "visible": "true",
        "disabled": "false",
        "groupType": "default"
    },
    {
        "id": "56781c0eadb27a50",
        "type": "ui-page",
        "name": "Code Manager",
        "ui": "5158dba2ce9db01c",
        "path": "/codes",
        "icon": "table_chart",
        "layout": "grid",
        "theme": "ui_theme_btn",
        "breakpoints": [
            {
                "name": "Default",
                "px": "0",
                "cols": "3"
            },
            {
                "name": "Tablet",
                "px": "576",
                "cols": "6"
            },
            {
                "name": "Desktop",
                "px": "1024",
                "cols": "12"
            }
        ],
        "order": 3,
        "className": "",
        "visible": "true",
        "disabled": "false"
    },
    {
        "id": "5158dba2ce9db01c",
        "type": "ui-base",
        "name": "Archery",
        "path": "/dashboard",
        "appIcon": "",
        "includeClientData": true,
        "acceptsClientConfig": [
            "ui-notification",
            "ui-control"
        ],
        "showPathInSidebar": false,
        "headerContent": "page",
        "navigationStyle": "default",
        "titleBarStyle": "default",
        "showReconnectNotification": true,
        "notificationDisplayTime": 1,
        "showDisconnectNotification": true,
        "allowInstall": true
    },
    {
        "id": "ui_theme_btn",
        "type": "ui-theme",
        "name": "Default Theme",
        "colors": {
            "surface": "#ffffff",
            "primary": "#1f6feb",
            "bgPage": "#f4f6f8",
            "groupBg": "#ffffff",
            "groupOutline": "#d0d7de"
        },
        "sizes": {
            "density": "default",
            "pagePadding": "12px",
            "groupGap": "12px",
            "groupBorderRadius": "6px",
            "widgetGap": "8px"
        }
    },
    {
        "id": "454d602afa226cac",
        "type": "global-config",
        "env": [],
        "modules": {
            "@flowfuse/node-red-dashboard": "1.30.2"
        }
    }
]
