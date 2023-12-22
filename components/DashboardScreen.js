import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useAuth } from '../authContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardScreen = () => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
  });
  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        'https://bitcoin-saving-backend.onrender.com/getExpenses',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      );
  
      const rawData = await response.text();
      console.log('Raw Data:', await rawData);
  
      // Check if the response body is empty
      if (!rawData) {
        console.error('Failed to fetch expenses: Empty response');
        return;
      }
  
      try {
        const data = JSON.parse(rawData);
  
        if (response.ok) {
          setExpenses(data.spendings);
        } else {
          console.error(
            'Failed to fetch expenses:',
            data.error || 'Unknown error'
          );
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError.message);
      }
    } catch (error) {
      console.error('Error during expense fetch:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

const handleAddExpense = async () => {
  try {
    const response = await fetch('https://bitcoin-saving-backend.onrender.com/addExpense', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        description: newExpense.description,
        amount: newExpense.amount,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Expense added successfully:', data);

      // Update the expenses array locally
      setExpenses((prevExpenses) => [...prevExpenses, data]); // Assuming the server returns the newly added expense
    } else {
      console.error('Failed to add expense:', data.error || 'Unknown error');
    }

    // Close the modal
    toggleModal();
  } catch (error) {
    console.error('Error while adding an expense:', error.message);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Track your expenses</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <Text style={styles.expenseDescription}>{`Description: ${item.description}`}</Text>
              <Text style={styles.expenseAmount}>{`Amount: ₹${item.amount}`}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </TouchableOpacity>

      {/* Expense Modal */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TextInput
              style={styles.input}
              placeholder="Description"
              onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
              value={newExpense.description}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
              value={newExpense.amount}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddExpense}>
              <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  expenseItem: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
  },
  expenseDescription: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: 'bold',
  },
  expenseAmount: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
});

export default DashboardScreen;

