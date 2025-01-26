#!/bin/bash

current_dir=$(basename "$PWD")
if [[ "$current_dir" != "edu_devops" ]]; then
  echo "This script must be run from the 'edu_devops' directory."
  exit 1
fi

# Check if yq is installed
if ! command -v yq &> /dev/null; then
  echo "Error: 'yq' is not installed. Please install it and try again."
  exit 1
fi

# Temporary file for sealed secrets key
sealed_secrets_file="sealed-secrets-key.yaml"

# Create sealed-secrets-key.yaml temporarily
echo "Creating temporary sealed-secrets-key.yaml file..."
kubectl get secret -n kubeseal -l sealedsecrets.bitnami.com/sealed-secrets-key -o yaml > "$sealed_secrets_file"

if [[ $? -ne 0 ]]; then
  echo "Failed to retrieve sealed secrets key. Exiting."
  exit 1
fi

# Run the kubeseal command
output_file="decoded-secret.yaml"
echo "Reading regcred in devops-app namespace"
kubeseal --controller-name=sealed-secrets --controller-namespace=sealed-secrets \
  < ./k8s/dist/apps/devops-app/base/regcred.yaml \
  --recovery-unseal --recovery-private-key "$sealed_secrets_file" -o yaml > "$output_file"

if [[ $? -ne 0 ]]; then
  echo "Failed to run kubeseal command. Exiting."
  rm -f "$sealed_secrets_file"
  exit 1
fi

# Base64 decode the `.dockerconfigjson` data
echo "Base64 decoding the .dockerconfigjson field in the edu_devops/k8s/dist/apps/devops-app/base/regcred.yaml"
dockerconfigjson=$(yq -r '.data[".dockerconfigjson"]' "$output_file" | base64 --decode)

if [[ $? -ne 0 ]]; then
  echo "Failed to decode .dockerconfigjson data. Exiting."
  rm -f "$sealed_secrets_file" "$output_file"
  exit 1
fi

echo "Decoded .dockerconfigjson:"
echo -e "\033[32m$dockerconfigjson\033[0m"

# Regcred secret in cluster
echo "Base64 decoding the regcred as the secret in devops-app namespace in the cluster"
echo "Decoded cluster's regcred:"
echo -e "\033[34m$(kubectl get secret regcred -n devops-app -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d)\033[0m"

if [[ $? -ne 0 ]]; then
  echo "Failed to decode cluster's regcred. Exiting."
  rm -f "$sealed_secrets_file" "$output_file"
  exit 1
fi

# Cleanup
echo "Cleaning up temporary files..."
rm -f "$sealed_secrets_file" "$output_file"

echo "Script execution completed successfully."

