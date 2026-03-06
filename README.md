# MaxTronyx

MaxTronyx is a prototype AI-powered Endpoint Detection and Response (EDR) platform designed to simulate modern Security Operations Center (SOC) capabilities.

The project demonstrates how endpoint telemetry, threat detection, automated response and AI analysis can be combined into a unified security platform.

## Architecture

MaxTronyx consists of several components:

- Go Endpoint Agent – collects telemetry from endpoints
- Node.js Backend – processes events, detections and responses
- SOC Dashboard – real-time monitoring interface
- Detection Engine – rule-based threat detection
- Host Risk Engine – calculates device risk scores
- AI Threat Analysis – intelligent analysis and explanation of incidents

## Features

- Endpoint telemetry collection
- Incident detection and classification
- MITRE ATT&CK technique mapping
- Host risk scoring
- Attack timeline reconstruction
- Response actions (contain, resolve, isolate)
- Real-time SOC dashboard
- AI-assisted incident analysis
- Threat explanation and investigation support

## Tech Stack

Backend
- Node.js
- Express

Agent
- Go (Golang)

Dashboard
- HTML
- CSS
- JavaScript

AI
- Large Language Model based threat analysis

## Project Goal

The goal of MaxTronyx is to demonstrate how a modern EDR platform could be designed, combining traditional detection mechanisms with AI-assisted security analysis.

## Author

Max Zanev
