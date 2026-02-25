SHELL := /bin/bash

.PHONY: dev stop status start-frontend start-backend start-chroma stop-frontend stop-backend stop-chroma

PID_DIR := .pids
LOG_DIR := .logs

FRONTEND_CMD := npm run dev:frontend
BACKEND_CMD := npm run dev:backend
CHROMA_CMD ?= chroma run --host 127.0.0.1 --port 8000 --path apps/backend/chroma

define start_service
	@mkdir -p $(PID_DIR) $(LOG_DIR)
	@if [ -f "$(PID_DIR)/$(1).pid" ] && kill -0 "$$(cat "$(PID_DIR)/$(1).pid")" 2>/dev/null; then \
		echo "$(1) already running (PID $$(cat "$(PID_DIR)/$(1).pid"))"; \
	else \
		echo "Starting $(1)..."; \
		nohup bash -lc '$(2)' > "$(LOG_DIR)/$(1).log" 2>&1 & echo $$! > "$(PID_DIR)/$(1).pid"; \
		sleep 1; \
		if kill -0 "$$(cat "$(PID_DIR)/$(1).pid")" 2>/dev/null; then \
			echo "$(1) started (PID $$(cat "$(PID_DIR)/$(1).pid"))"; \
		else \
			echo "Failed to start $(1). Check $(LOG_DIR)/$(1).log"; \
			rm -f "$(PID_DIR)/$(1).pid"; \
			exit 1; \
		fi; \
	fi
endef

define stop_service
	@if [ -f "$(PID_DIR)/$(1).pid" ]; then \
		PID="$$(cat "$(PID_DIR)/$(1).pid")"; \
		if kill -0 "$$PID" 2>/dev/null; then \
			echo "Stopping $(1) (PID $$PID)..."; \
			kill "$$PID" 2>/dev/null || true; \
			sleep 1; \
			if kill -0 "$$PID" 2>/dev/null; then \
				echo "Force killing $(1) (PID $$PID)..."; \
				kill -9 "$$PID" 2>/dev/null || true; \
			fi; \
		else \
			echo "$(1) PID file exists but process is not running."; \
		fi; \
		rm -f "$(PID_DIR)/$(1).pid"; \
	else \
		echo "$(1) is not running."; \
	fi
endef

dev: start-chroma start-backend start-frontend
	@echo "All services started."
	@echo "Logs: $(LOG_DIR)/chroma.log, $(LOG_DIR)/backend.log, $(LOG_DIR)/frontend.log"

stop: stop-frontend stop-backend stop-chroma
	@echo "All services stopped."

status:
	@for svc in chroma backend frontend; do \
		if [ -f "$(PID_DIR)/$$svc.pid" ] && kill -0 "$$(cat "$(PID_DIR)/$$svc.pid")" 2>/dev/null; then \
			echo "$$svc: running (PID $$(cat "$(PID_DIR)/$$svc.pid"))"; \
		else \
			echo "$$svc: stopped"; \
		fi; \
	done

start-frontend:
	$(call start_service,frontend,$(FRONTEND_CMD))

start-backend:
	$(call start_service,backend,$(BACKEND_CMD))

start-chroma:
	$(call start_service,chroma,$(CHROMA_CMD))

stop-frontend:
	$(call stop_service,frontend)

stop-backend:
	$(call stop_service,backend)

stop-chroma:
	$(call stop_service,chroma)
