.PHONY: install init-db ingest watch analyze api web dev test clean

# Install dependencies
install:
	npm install

# Initialize database
init-db:
	npm run init-db

# Ingest data from input files
ingest:
	npm run ingest

# Fetch provider updates (use SIMULATED=false for live fetching)
watch:
	npm run watch -- $(if $(SIMULATED),--simulated,--simulated)

# Analyze unprocessed updates
analyze:
	npm run analyze

# Run API server
api:
	npm run api

# Run web dashboard
web:
	npm run web

# Run both API and web servers
dev:
	npm run dev

# Run tests
test:
	npm test

# Clean database and parsed files
clean:
	rm -f data/dev.db
	rm -f context/parsed/*.json
	rm -rf data/snapshots/*

# Full setup: install, init, ingest
setup: install init-db ingest
	@echo "Setup complete! Run 'make dev' to start the servers."

# Demo workflow: fetch updates, analyze, then start servers
demo: setup
	npm run watch -- --simulated
	npm run analyze
	@echo "\nDemo data loaded. Starting servers..."
	npm run dev
