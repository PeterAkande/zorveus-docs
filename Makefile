.PHONY: dev build start install typecheck clean help

PORT ?= 3495

# Default target
.DEFAULT_GOAL := help

## dev: Start development server
dev:
	@echo "Starting development server on port $(PORT)..."
	npm run dev -- -p $(PORT)

## install: Install project dependencies
install:
	@echo "Installing dependencies..."
	npm install

## build: Build production application
build:
	@echo "Building production bundle..."
	npm run build

## start: Start production server
start:
	@echo "Starting production server on port $(PORT)..."
	npm run start -- -p $(PORT)

## typecheck: Run TypeScript type check
typecheck:
	@echo "Running TypeScript type check..."
	npm run typecheck

## clean: Remove build artifacts
clean:
	@echo "Cleaning build cache..."
	rm -rf .next

## help: Display available targets
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  dev        Start dev server (default port 3495, override with PORT=3496)"
	@echo "  install    Install dependencies"
	@echo "  build      Build production bundle"
	@echo "  start      Start production server"
	@echo "  typecheck  Run TypeScript type check"
	@echo "  clean      Clean .next build cache"
	@echo "  help       Display this help message"
