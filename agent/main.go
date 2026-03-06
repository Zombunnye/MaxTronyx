package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type Agent struct {
	Hostname string `json:"hostname"`
	Ip       string `json:"ip"`
}

func registerAgent() {
	hostname, _ := os.Hostname()

	agent := Agent{
		Hostname: hostname,
		Ip:       "127.0.0.1",
	}

	jsonData, _ := json.Marshal(agent)

	http.Post(
		"http://localhost:4000/api/v1/agents/register",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	fmt.Println("Agent registered")
}

func sendRansomwareEvent(hostname string) {
	event := map[string]interface{}{
		"type":          "ransomware",
		"files_changed": 200,
		"hostname":      hostname,
	}

	jsonData, _ := json.Marshal(event)

	http.Post(
		"http://localhost:4000/api/v1/events",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	fmt.Println("Ransomware event sent")
}

func sendPowerShellEvent(hostname string) {
	event := map[string]interface{}{
		"process":  "powershell -enc aGVsbG8=",
		"hostname": hostname,
	}

	jsonData, _ := json.Marshal(event)

	http.Post(
		"http://localhost:4000/api/v1/events",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	fmt.Println("PowerShell event sent")
}

func sendCryptoMinerEvent(hostname string) {
	event := map[string]interface{}{
		"process":  "xmrig.exe",
		"hostname": hostname,
	}

	jsonData, _ := json.Marshal(event)

	http.Post(
		"http://localhost:4000/api/v1/events",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	fmt.Println("Crypto miner event sent")
}

func sendBruteForceEvent(hostname string) {
	event := map[string]interface{}{
		"failed_logins": 20,
		"hostname":      hostname,
	}

	jsonData, _ := json.Marshal(event)

	http.Post(
		"http://localhost:4000/api/v1/events",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	fmt.Println("Brute force event sent")
}

func sendHeartbeat(hostname string) {
	event := map[string]interface{}{
		"hostname": hostname,
	}

	jsonData, _ := json.Marshal(event)

	http.Post(
		"http://localhost:4000/api/v1/heartbeat",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	fmt.Println("Heartbeat sent")
}

func main() {
	hostname, _ := os.Hostname()

	registerAgent()

	sendRansomwareEvent(hostname)
	sendPowerShellEvent(hostname)
	sendCryptoMinerEvent(hostname)
	sendBruteForceEvent(hostname)

	for {
		sendHeartbeat(hostname)
		time.Sleep(10 * time.Second)
	}
}
