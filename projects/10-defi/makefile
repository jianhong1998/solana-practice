PROJECT_NAME = "10-defi"
# Must be the keypair of `./tests/fixtures/keypairs/program-owner-id.json`
PROGRAM_OWNER_PUBKEY = "Po8d1QjUKezSQV9AR3g5AYDQRAZNCEksPRWZWYgy7j1"

up/build:
	@docker compose \
		-p ${PROJECT_NAME} \
		up --build -w --remove-orphans

up:
	@docker compose \
		-p ${PROJECT_NAME} \
		up -w

down:
	@docker compose \
		-p ${PROJECT_NAME} \
		down && \
		$(MAKE) clean-image

down/clean:
	@$(MAKE) down && \
		rm -rf ./solana-ledger && \
		$(MAKE) clean-image

clean-image:
	@docker image prune -f

solana/set/dev:
	@solana config set -ud -k ~/.config/solana/devnet-id.json

solana/set/local:
	@solana config set -ul -k ~/.config/solana/local-id.json

test:
		IS_TESTING_ON_CHAIN=false anchor test --skip-local-validator --skip-deploy

test/onchain:
		IS_TESTING_ON_CHAIN=true anchor test --skip-local-validator

test/onchain/skip-deploy:
		IS_TESTING_ON_CHAIN=true anchor test --skip-local-validator --skip-deploy

deploy:
	@anchor build && \
		anchor deploy

deploy/with-airdrop:
	@solana config set -ul -k ~/.config/solana/local-id.json && \
		solana airdrop 10 ${PROGRAM_OWNER_PUBKEY} && \
		$(MAKE) deploy

anchor/build:
		anchor build