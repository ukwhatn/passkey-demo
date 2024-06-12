/**
 * 文字列をArrayBufferに変換する
 * -> WebAuthnではバイナリデータを扱うため、文字列をArrayBufferに変換する必要がある
 * @param str
 * @returns {ArrayBuffer}
 */
const strToBuffer = (str) => {
    const buffer = new ArrayBuffer(str.length);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        bufferView[i] = str.charCodeAt(i);
    }
    return buffer;
}

/**
 * サーバーからチャレンジを取得する
 * @returns {Promise<string>}
 */
const getChallenge = async () => {
    const response = await fetch('/api/v1/getChallenge');
    const data = await response.json();
    const challenge = data.challenge;

    return btoa(challenge);
};

/**
 * WebAuthnの登録処理を行う
 * @param challenge {string} チャレンジ
 * @returns {Promise<Credential>}
 */
const callPasskeyRegistration = async (challenge) => {
    const options = {
        challenge: strToBuffer(atob(challenge)),
        rp: {
            name: "DemonstrationSite",  // RPの名前（サイト名）
            id: "localhost"  // RPのID（ドメイン名）
        },
        user: {
            id: strToBuffer("testuser"),  // ユーザーID -> ArrayBufferに変換する
            name: "testuser",  // ユーザー名
            displayName: "Test User"  // 表示名
        },
        pubKeyCredParams: [ // RPがサポートする公開鍵暗号化方式
            {
                type: "public-key",
                alg: -7  // ES256
            }
        ],
        excludeCredentials: [],
        authenticatorSelection: {
            authenticatorAttachment: "platform",  // プラットフォーム認証器を指定
            requireResidentKey: false,  // ユーザー認証器による認証を要求
            userVerification: "preferred"  // ユーザー認証を要求
        }
    }

    return await navigator.credentials.create({publicKey: options})
}


const registerRequest = async (cred) => {
    const response = await fetch('/api/v1/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cred.toJSON())
    });
    return await response.json();
}


const register = async () => {
    const challenge = await getChallenge();
    const cred = await callPasskeyRegistration(challenge);
    console.log(cred);
}
