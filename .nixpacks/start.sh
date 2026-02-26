#!/bin/bash
cd backend
. venv/bin/activate
gunicorn app:app
