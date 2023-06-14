import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import themeConfig from '../themeConfig';
import { useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { firestore, auth } from '../firebaseConfig.js';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';
import Context from './Context';

const Detail = ({ navigation }) => {
  const route = useRoute();
  const date = route.params?.date;

  const formattedDate = date ? new Date(date) : new Date();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const { reload, setReload } = useContext(Context);

  useEffect(() => {
    const fetchTransactions = async () => {
      const transactionsCollectionRef = collection(firestore, 'transactions');
      const userID = auth.currentUser.uid;

      const q = query(
        transactionsCollectionRef,
        where('userID', '==', userID),
        where('transactionDate', '==', formattedDate.toDateString())
      );

      try {
        const querySnapshot = await getDocs(q);
        const transactionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error retrieving transactions:', error);
      } finally {
        setLoading(false); // Set loading state to false when data is fetched
      }
    };

    fetchTransactions();
    setReload(false);
  }, [reload]);

  const handleDelete = async (transactionID, transactionType, transactionAmount) => {
    console.log(transactionID);
    try {
      await deleteDoc(doc(firestore, 'transactions', transactionID));

      if (transactionType === 'Expense') {
        const userID = auth.currentUser.uid;
        const userDocRef = doc(firestore, 'users', userID);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          const { expenseTotal, budgetLeft } = userData;

          const updatedExpenseTotal = expenseTotal - transactionAmount;
          const updatedBudgetLeft = budgetLeft + transactionAmount;

          await updateDoc(userDocRef, {
            expenseTotal: updatedExpenseTotal,
            budgetLeft: updatedBudgetLeft,
          });
        }
      } else if (transactionType === 'Income') {
        const userID = auth.currentUser.uid;
        const userDocRef = doc(firestore, 'users', userID);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          const { incomeTotal } = userData;

          const updatedIncomeTotal = incomeTotal - transactionAmount;

          await updateDoc(userDocRef, {
            incomeTotal: updatedIncomeTotal,
          });
        }
      }
      alert('Transaction deleted successfully!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete the transaction. Please try again.');
    }
    setReload(true);
  };

  const renderItem = ({ item }) => {
    const {
      id,
      transactionAmount,
      transactionCategory,
      transactionDate,
      transactionDescription,
      transactionType,
      userID,
    } = item;

    const amountTextStyle =
      transactionType === 'Expense'
        ? [styles.transactionAmountText, styles.expenseAmountText]
        : [styles.transactionAmountText, styles.incomeAmountText];

        return (
          <View style={styles.transactionItem}>
            <Text style={styles.transactionTypeText}>{transactionType}</Text>
            <View style={styles.transactionInfoContainer}>
              <Text
                style={[
                  styles.transactionCategoryText,
                  transactionDescription === '' && styles.centeredTransactionCategoryText
                ]}
              >
                {transactionCategory}
              </Text>
              <Text style={styles.transactionDescriptionText}>{transactionDescription}</Text>
            </View>
            <Text style={[amountTextStyle]}>{transactionAmount}</Text>
            <View style={{ width: '7%', marginLeft: 'auto'}}>
              <TouchableOpacity
                onPress={() => {
                  handleDelete(id, transactionType, transactionAmount);
                }}
                style={styles.deleteIconContainer}
              >
                <Feather name='trash' size={16} color='#888888' />
              </TouchableOpacity>
            </View>
          </View>
        );
        

  };

  const handleAddTransaction = () => {
    navigation.navigate('Transaction', { date: date });
  };

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  if (loading) {
    // Show loading indicator while fetching data
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={themeConfig.primary} />
      </View>
    );
  }

  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const formattedDateString = formattedDate.toLocaleDateString('en-US', options);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Transactions Of {formattedDateString}</Text>
      
      <FlatList data={transactions} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />
      
      <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
        <Ionicons name='md-arrow-back' size={30} color={themeConfig.white} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.floatingButton} onPress={handleAddTransaction}>
        <Ionicons name='md-add' size={30} color={themeConfig.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeConfig.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeConfig.white,
  },
  transactionItem: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: themeConfig.white,
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 10,
    borderColor: themeConfig.primary,
  },
  transactionTypeText: {
    fontSize: 14,
    color: themeConfig.gray,
    width: '20%',
  },
  centeredTransactionCategoryText: {
    top: 11,
  },
  transactionInfoContainer: {
    width: '55%',
    marginLeft: 10,
  },
  transactionCategoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDescriptionText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#888888',
  },
  transactionAmountText: {
    fontSize: 16,
    
  },
  expenseAmountText: {
    color: themeConfig.red,
  },
  incomeAmountText: {
    color: themeConfig.green,
    
  },
  deleteIconContainer: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#888888',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderRadius: 10,
    
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    backgroundColor: themeConfig.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    backgroundColor: themeConfig.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
});

export default Detail;
