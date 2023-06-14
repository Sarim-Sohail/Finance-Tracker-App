import React, { useState, useEffect, useContext } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import themeConfig from '../themeConfig'
import { useRoute } from '@react-navigation/native'
import { firestore, auth } from '../firebaseConfig.js'
import {
  doc,
  addDoc,
  getDoc,
  collection,
  updateDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore'
import Context from './Context'
import axios from 'axios'
import { ActivityIndicator } from 'react-native-paper'

const Transaction = ({ navigation }) => {
  const [transactionType, setTransactionType] = useState('Expense')
  const [transactionCategory, setTransactionCategory] = useState('Debt')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionDescription, setTransactionDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date())
  const { reload, setReload } = useContext(Context)
  const { token } = useContext(Context)
  const route = useRoute()
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    const setDate = async () => {
      try {
        const date = route.params?.date
        const formattedDate = date ? new Date(date) : new Date()
        setTransactionDate(formattedDate)
      } catch (error) {
        alert(error.message)
      }
    }

    setDate()
  }, [])

  const sendNotification = async () => {
    const notificationData = {
      to: token,
      notification: {
        title: 'New Transaction Added',
        body: "You've just added a new transaction!"
      },
      data: {
        url: 'url',
        dl: 'deeplinking'
      }
    }

    try {
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        notificationData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer ((YOUR SECRET KEY))'
          }
        }
      )

      console.log('Notification sent successfully:', response.data)
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const handleAddTransaction = async () => {
    
    if (!transactionType || !transactionCategory || !transactionAmount) {
      alert('Please fill in all the required fields')
      return
    }

    setDisabled(true)

    const transactionsCollectionRef = collection(firestore, 'transactions')
    const userID = auth.currentUser.uid
    try {
      const newTransaction = {
        userID,
        transactionType,
        transactionCategory,
        transactionAmount: parseFloat(transactionAmount),
        transactionDescription,
        transactionDate: new Date(transactionDate).toDateString()
      }
      const docRef = await addDoc(transactionsCollectionRef, newTransaction)

      const userDocRef = doc(firestore, 'users', userID)
      const userDocSnapshot = await getDoc(userDocRef)
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data()
        const { expenseTotal, incomeTotal, budgetLeft } = userData

        const transactionAmount = newTransaction.transactionAmount
        if (newTransaction.transactionType === 'Expense') {
          const updatedExpenseTotal = expenseTotal + transactionAmount
          const updatedBudgetLeft = budgetLeft - transactionAmount
          await updateDoc(userDocRef, {
            expenseTotal: updatedExpenseTotal,
            budgetLeft: updatedBudgetLeft
          })
        } else if (newTransaction.transactionType === 'Income') {
          const updatedIncomeTotal = incomeTotal + transactionAmount
          await updateDoc(userDocRef, {
            incomeTotal: updatedIncomeTotal
          })
        }
      }
      setDisabled(false)
      setReload(true)
      sendNotification()
      navigation.goBack()
    } catch (error) {
      console.error('Error retrieving transaction document:', error)
    }
    
  }

  const renderExpenseCategories = () => (
    <Picker
      selectedValue={transactionCategory}
      onValueChange={value => setTransactionCategory(value)}
      style={styles.dropdown}
    >
      <Picker.Item label='Debt' value='Debt' />
      <Picker.Item label='Food' value='Food' />
      <Picker.Item label='Transportation' value='Transportation' />
      <Picker.Item label='Clothing' value='Clothing' />
      <Picker.Item label='Education' value='Education' />
      <Picker.Item label='Bill' value='Bill' />
      <Picker.Item label='Gift' value='Gift' />
      <Picker.Item label='Vacation' value='Vacation' />
      <Picker.Item label='Health' value='Health' />
      <Picker.Item label='Other' value='Other' />
    </Picker>
  )

  const renderIncomeCategories = () => (
    <Picker
      selectedValue={transactionCategory}
      onValueChange={value => setTransactionCategory(value)}
      style={styles.dropdown}
    >
      <Picker.Item label='Salary' value='Salary' />
      <Picker.Item label='Freelancing' value='Freelancing' />
      <Picker.Item label='Inheritance' value='Inheritance' />
      <Picker.Item label='Allowance' value='Allowance' />
      <Picker.Item label='Other' value='Other' />
    </Picker>
  )

  const renderCategories = () => {
    if (transactionType === 'Expense') {
      return renderExpenseCategories()
    } else if (transactionType === 'Income') {
      return renderIncomeCategories()
    }
  }

  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
  const formattedDateString = transactionDate.toLocaleDateString(
    'en-US',
    options
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.header}>
          Add Transaction for {formattedDateString}
        </Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Type:</Text>
          <Picker
            selectedValue={transactionType}
            onValueChange={value => setTransactionType(value)}
            style={styles.dropdown}
          >
            <Picker.Item label='Expense' value='Expense' />
            <Picker.Item label='Income' value='Income' />
          </Picker>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category:</Text>

          {renderCategories()}
        </View>

        <KeyboardAvoidingView
          style={styles.fieldContainerLabel}
          behavior='position'
        >
          <Text style={styles.label}>Amount:</Text>
          <TextInput
            value={transactionAmount}
            onChangeText={text => setTransactionAmount(text)}
            style={styles.input}
            keyboardType='numeric'
            placeholder='Enter Amount'
            returnKeyType='done'
          />
        </KeyboardAvoidingView>

        <KeyboardAvoidingView
          style={styles.fieldContainerLabel}
          behavior='position'
        >
          <Text style={styles.label}>Description:</Text>
          <TextInput
            value={transactionDescription}
            onChangeText={text => setTransactionDescription(text)}
            style={styles.input}
            placeholder='Enter Description'
          />
        </KeyboardAvoidingView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTransaction}
          disabled={disabled}
        >
          {disabled ? (
            <ActivityIndicator size='small' color={themeConfig.white} />
          ) : (
            <Text style={styles.buttonText}>Add Transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeConfig.white,
    height: '100%'
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20
  },
  fieldContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: themeConfig.lightGray
  },
  fieldContainerLabel: {
    marginBottom: 20
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 5,
    marginHorizontal: 10
  },
  dropdown: {
    backgroundColor: themeConfig.white,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: themeConfig.lightGray
  },
  input: {
    backgroundColor: themeConfig.white,
    borderWidth: 1,
    borderColor: themeConfig.lightGray,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  addButton: {
    backgroundColor: themeConfig.primary,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    width: '70%',
    alignSelf: 'center'
  },
  buttonText: {
    color: themeConfig.white,
    fontWeight: 'bold',
    textAlign: 'center'
  }
})

export default Transaction
