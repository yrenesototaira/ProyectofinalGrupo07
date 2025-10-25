#!/bin/bash
# Script para compilar todos los microservicios de Marakos Grill

echo "🚀 Compilando todos los microservicios de Marakos Grill..."
echo "=================================================="

# Configurar Java 17
export JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-17.0.16.8-hotspot"
export PATH="$JAVA_HOME/bin:$PATH"

echo "✅ Java configurado: $(java -version 2>&1 | head -1)"
echo ""

# Compilar Auth Service
echo "📦 Compilando Auth Service..."
cd auth-service
./gradlew compileJava --no-daemon
if [ $? -eq 0 ]; then
    echo "✅ Auth Service: BUILD SUCCESSFUL"
else
    echo "❌ Auth Service: BUILD FAILED"
    exit 1
fi
cd ..
echo ""

# Compilar Customer Service
echo "📦 Compilando Customer Service..."
cd customer-service
./gradlew compileJava --no-daemon
if [ $? -eq 0 ]; then
    echo "✅ Customer Service: BUILD SUCCESSFUL"
else
    echo "❌ Customer Service: BUILD FAILED"
    exit 1
fi
cd ..
echo ""

# Compilar Management Service
echo "📦 Compilando Management Service..."
cd management-service
./gradlew compileJava --no-daemon
if [ $? -eq 0 ]; then
    echo "✅ Management Service: BUILD SUCCESSFUL"
else
    echo "❌ Management Service: BUILD FAILED"
    exit 1
fi
cd ..
echo ""

# Compilar Reservation Service
echo "📦 Compilando Reservation Service..."
cd reservation-service
./gradlew compileJava --no-daemon
if [ $? -eq 0 ]; then
    echo "✅ Reservation Service: BUILD SUCCESSFUL"
else
    echo "❌ Reservation Service: BUILD FAILED"
    exit 1
fi
cd ..
echo ""

echo "🎉 ¡Todos los microservicios compilados exitosamente!"
echo "=================================================="