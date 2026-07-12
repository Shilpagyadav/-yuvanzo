import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍽️ Yuvanzo</Text>
        <Text style={styles.subtitle}>Your Food, Your Way</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pizza Palace</Text>
          <Text style={styles.cardCuisine}>🍽️ Italian</Text>
          <Text style={styles.cardRating}>⭐ 5.00</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Menu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>MTR - Mavalli Tiffin Room</Text>
          <Text style={styles.cardCuisine}>🍽️ South Indian</Text>
          <Text style={styles.cardRating}>⭐ 4.80</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Menu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vidyarthi Bhavan</Text>
          <Text style={styles.cardCuisine}>🍽️ South Indian</Text>
          <Text style={styles.cardRating}>⭐ 4.70</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6C5CE7',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  cardCuisine: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  cardRating: {
    fontSize: 14,
    color: '#FDCB6E',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#6C5CE7',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});