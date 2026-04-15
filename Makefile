.PHONY: help install build test lint clean dev docker-up docker-down seed

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

build: ## Build TypeScript
	npm run build

test: ## Run tests
	npm test

test-coverage: ## Run tests with coverage
	npm run test:coverage

lint: ## Run linter
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint:fix

format: ## Format code with Prettier
	npx prettier --write "**/*.ts"

clean: ## Clean build files
	rm -rf dist
	rm -rf coverage

dev: ## Start development server
	npm run dev

docker-up: ## Start Docker services
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

seed: ## Seed database
	npm run seed

migrate: ## Run database migrations
	npx prisma migrate dev

generate: ## Generate Prisma client
	npx prisma generate

studio: ## Open Prisma Studio
	npx prisma studio

cli-trace: ## CLI example - trace wallet
	npx ts-node cli/index.ts trace 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

cli-health: ## CLI example - check health
	npx ts-node cli/index.ts health
