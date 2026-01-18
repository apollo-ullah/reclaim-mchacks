#!/bin/bash

###############################################################################
# C2PA Certificate Generation Script
# 
# This script generates a self-signed X.509 certificate and private key
# for C2PA development and testing purposes using ES256 (ECDSA P-256).
#
# C2PA Recommendation: Use ECDSA with P-256 curve and SHA-256 (ES256)
# for optimal compatibility and security.
#
# WARNING: These certificates are for DEVELOPMENT ONLY and should NOT be
# used in production. For production, you need certificates from a trusted CA.
###############################################################################

set -e

# Configuration
CERTS_DIR="./certs"
PRIVATE_KEY="$CERTS_DIR/private.key"
CERTIFICATE="$CERTS_DIR/certificate.pem"
CSR_FILE="$CERTS_DIR/request.csr"
CONFIG_FILE="$CERTS_DIR/openssl.cnf"
DAYS_VALID=365

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  C2PA Certificate Generation Script (ES256)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

# Create certs directory if it doesn't exist
if [ ! -d "$CERTS_DIR" ]; then
    echo -e "${GREEN}✓${NC} Creating certs directory..."
    mkdir -p "$CERTS_DIR"
else
    echo -e "${YELLOW}⚠${NC}  Certs directory already exists"
fi

# Create OpenSSL configuration file for C2PA
# Includes Extended Key Usage (EKU) for documentSigning and emailProtection
echo -e "${GREEN}✓${NC} Creating OpenSSL configuration..."
cat > "$CONFIG_FILE" << EOF
[req]
default_md = sha256
prompt = no
distinguished_name = dn
req_extensions = v3_req

[dn]
C = US
ST = California
L = San Francisco
O = Reclaim Development
OU = Content Authenticity
CN = Reclaim C2PA Dev Signer
emailAddress = dev@reclaim.local

[v3_req]
basicConstraints = CA:FALSE
keyUsage = critical, digitalSignature
extendedKeyUsage = emailProtection, 1.3.6.1.4.1.311.10.3.12
subjectKeyIdentifier = hash

[v3_ca]
basicConstraints = CA:FALSE
keyUsage = critical, digitalSignature
extendedKeyUsage = emailProtection, 1.3.6.1.4.1.311.10.3.12
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always
EOF

echo -e "${GREEN}✓${NC} Generating ECDSA private key (P-256 curve)..."
# Generate P-256 (prime256v1) elliptic curve private key in PKCS#8 format
# The -out writes EC format, so we need to convert it to PKCS#8
openssl ecparam -name prime256v1 -genkey -noout | \
  openssl pkcs8 -topk8 -nocrypt -out "$PRIVATE_KEY" 2>/dev/null

echo -e "${GREEN}✓${NC} Creating Certificate Signing Request (CSR)..."
openssl req -new \
    -key "$PRIVATE_KEY" \
    -out "$CSR_FILE" \
    -config "$CONFIG_FILE" \
    2>/dev/null

echo -e "${GREEN}✓${NC} Generating self-signed X.509 certificate (ES256)..."
openssl x509 -req \
    -in "$CSR_FILE" \
    -signkey "$PRIVATE_KEY" \
    -out "$CERTIFICATE" \
    -days $DAYS_VALID \
    -extensions v3_ca \
    -extfile "$CONFIG_FILE" \
    -sha256 \
    2>/dev/null

# Set appropriate permissions
chmod 600 "$PRIVATE_KEY"
chmod 644 "$CERTIFICATE"

# Clean up CSR file
rm -f "$CSR_FILE"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Certificate Generation Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Generated files:"
echo "  🔐 Private Key:  $PRIVATE_KEY (ES256/P-256)"
echo "  📄 Certificate:  $CERTIFICATE"
echo ""
echo "Certificate Details:"
openssl x509 -in "$CERTIFICATE" -noout -subject -issuer -dates
echo ""
echo "Key Usage:"
openssl x509 -in "$CERTIFICATE" -noout -ext keyUsage,extendedKeyUsage
echo ""
echo -e "${YELLOW}⚠  IMPORTANT: Keep your private key secure!${NC}"
echo -e "${YELLOW}⚠  These certificates are for DEVELOPMENT ONLY${NC}"
echo -e "${BLUE}ℹ  Algorithm: ES256 (ECDSA with P-256 and SHA-256)${NC}"
echo ""

