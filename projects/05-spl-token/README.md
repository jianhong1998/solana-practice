# Mint Token with CLI

**Mint Authority** Public Key: `aqCD2w1TeJz2txToZVjijPEmXnphpTAuWqETtmTkBba`
**Token Mint** Public Key: `FXeKJGaxh9NeyXiCygQPXntf2cdC9mPkbKvVE8zoK3ip`
Generated **Token Mint Account** Public Key: `AYmopLEFAatxHAvkQwJMtydEyVEGJtrXNLGj9iiw7MWE`

Token Extensions program ID:
(Old `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
(New `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)

```bash
# Setup solana CLI
solana config set -UL -k /<<PATH_TO_ROOT_FOLDER>>/keypair/mint-authority.json

# Create Token
spl-token create-token --enable-metadata -p "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" ./keypair/token-mint.json

# Initialize Token Metadata
spl-token initialize-metadata <<TOKEN_MINT_PUBLIC_KEY>> "My First Token" "MFT001" <<URL_HOST_TOKEN_METADATA_JSON_FILE>>

# Mint Token
spl-token mint <<TOKEN_MINT_PUBLIC_KEY>> 1000
```
