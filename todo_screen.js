import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import * as firebaseApp from 'firebase';
import {
  Button,
  Snackbar,
  Portal,
  Dialog,
  Paragraph,
  Searchbar,
  Provider as PaperProvider,
} from 'react-native-paper';

import {Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

let Config = {
  apiKey: 'AIzaSyAQgzL0lGEeFv_Th0kCy_qJpA6iqCXa4i8',
  authDomain: 'digitalcube-d2b69.firebaseapp.com',
  databaseURL: 'https://digitalcube-d2b69.firebaseio.com',
  projectId: 'digitalcube-d2b69',
  storageBucket: 'digitalcube-d2b69.appspot.com',
  messagingSenderId: '678088808618',
};

let themeColor = '#ff0066';

export default class ToDoScreen extends React.Component {
  constructor(props) {
    super(props);

    if (!firebaseApp.apps.length) {
      firebaseApp.initializeApp(Config);
    }

    const {navigation} = this.props;
    const user = navigation.getParam('user', 'NO-user');
    this.tasksRef = firebaseApp.database().ref('/items/' + user.uid);

    const dataSource = [];
    this.state = {
      dataSource: dataSource,
      selecteditem: null,
      snackbarVisible: false,
      confirmVisible: false,
      detailPortal: false,
      modifyItem: null,
    };
  }

  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'ToDo List',
      headerLeft: (
        <Button
          // icon={'lock-open'}
          onPress={async () => {
            try {
              await firebaseApp.auth().signOut();
              navigation.goBack();
            } catch (e) {
              console.log(e);
            }
          }}
          color={themeColor}>
          Log Out
        </Button>
      ),
    };
  };
  componentDidMount() {
    // start listening for firebase updates
    this.listenForTasks(this.tasksRef);
  }

  listenForTasks(tasksRef) {
    tasksRef.on('value', dataSnapshot => {
      let tasks = [];
      dataSnapshot.forEach(child => {
        tasks.push({
          name: child.val().name,
          date: child.val().date,
          completed: child.val().completed,
          key: child.key,
        });
      });

      this.setState({
        dataSource: tasks,
      });
    });
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          width: '100%',
          height: 2,
          backgroundColor: themeColor,
        }}>
        <View />
      </View>
    );
  };

  deleteItem(item) {
    this.setState({deleteItem: item, confirmVisible: true});
  }

  performDeleteItem(key) {
    const {navigation} = this.props;
    const user = navigation.getParam('user', 'NO-user');
    let updates = {};
    updates['/items/' + user.uid + '/' + key] = null;
    return firebaseApp
      .database()
      .ref()
      .update(updates);
  }

  performMarkComplete(mark, item) {
    let updates = {};

    const {navigation} = this.props;
    const user = navigation.getParam('user', 'NO-user');
    console.log('item', item);
    updates['/items/' + user.uid + '/' + item.key] = {
      date: item.date,
      name: item.name,
      completed: mark,
    };

    return firebaseApp
      .database()
      .ref()
      .update(updates);
  }

  addItem(itemName) {
    let newPostKey = firebaseApp
      .database()
      .ref()
      .child('items')
      .push().key;

    const date = new Date().getDate(); //Current Date
    const month = new Date().getMonth() + 1; //Current Month
    const year = new Date().getFullYear(); //Current Year
    const hours = new Date().getHours(); //Current Hours
    const min = new Date().getMinutes(); //Current Minutes
    const sec = new Date().getSeconds(); //Current Seconds
    const {navigation} = this.props;
    const user = navigation.getParam('user', 'NO-user');
    let updates = {};
    updates['/items/' + user.uid + '/' + newPostKey] = {
      completed: false,
      name:
        itemName === '' || itemName === undefined
          ? this.state.itemname
          : itemName,
      date:
        date + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec,
    };

    return firebaseApp
      .database()
      .ref()
      .update(updates);
  }

  updateItem() {
    let updates = {};
    console.log('this.state.selecteditem', this.state.selecteditem);
    const {navigation} = this.props;
    const user = navigation.getParam('user', 'NO-user');
    updates['/items/' + user.uid + '/' + this.state.selecteditem.key] = {
      completed: this.state.selecteditem.completed,
      name: this.state.itemname,
      date: this.state.selecteditem.date,
    };

    return firebaseApp
      .database()
      .ref()
      .update(updates);
  }

  saveItem() {
    if (this.state.selecteditem === null) {
      this.addItem();
    } else {
      this.updateItem();
    }

    this.setState({itemname: '', selecteditem: null});
  }

  hideDialog(yesNo) {
    this.setState({confirmVisible: false});
    if (yesNo === true) {
      this.performDeleteItem(this.state.deleteItem.key).then(() => {
        this.setState({snackbarVisible: true});
      });
    }
  }

  hideDetailPortal(yesNo) {
    this.setState({detailPortal: false});
    if (yesNo === true) {
      this.setState({detailPortal: true});
    }
  }

  markComplete(yesNo, selecteditem) {
    this.performMarkComplete(yesNo, selecteditem).then(() => {
      this.setState({detailPortal: false});
    });
  }

  showDialog() {
    this.setState({confirmVisible: true});
    console.log('in show dialog');
  }

  undoDeleteItem() {
    this.addItem(this.state.deleteItem.name);
  }

  render() {
    const {navigation} = this.props;
    const user = navigation.getParam('user', 'NO-user');

    return (
      <PaperProvider>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{flex: 1}}>
            <Text style={{fontSize: 16, paddingHorizontal: 10}}>
              Hello {user.email} !
            </Text>
            <Text style={{fontSize: 20, fontWeight: 'bold', padding: 10}}>
              ToDo list
            </Text>
            <Searchbar
              placeholder="ToDo item"
              style={{
                fontSize: 16,
                height: 50,
                width: '100%',
                borderColor: themeColor,
                borderRadius: 35,
                borderWidth: 2,
              }}
              icon={'check'}
              onChangeText={text => this.setState({itemname: text})}
              value={this.state.itemname}
            />
            <View style={{height: 10}} />
            <Button
              color={themeColor}
              icon={this.state.selecteditem === null ? 'add' : 'update'}
              mode="contained"
              onPress={() => this.saveItem()}>
              {this.state.selecteditem === null ? 'add' : 'Modify'}
            </Button>
            <FlatList
              data={this.state.dataSource}
              renderItem={({item}) => (
                <View>
                  <ScrollView horizontal={true}>
                    <TouchableWithoutFeedback>
                      <View
                        style={{
                          padding: 10,
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                        }}>
                        <Text
                          style={{color: themeColor}}
                          onPress={() => this.deleteItem(item)}>
                          <Icon name="md-trash" size={25} />
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                      onPress={() =>
                        this.setState({
                          selecteditem: item,
                          itemname: item.name,
                        })
                      }>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={styles.item}>{item.name} </Text>
                      </View>
                    </TouchableWithoutFeedback>
                    <Text
                      style={{color: themeColor}}
                      onPress={() =>
                        this.setState({
                          detailPortal: true,
                          modifyItem: item,
                        })
                      }>
                      {item.completed ? (
                        <Icon name="ios-done-all" size={25} color={'green'} />
                      ) : (
                        <Icon name="ios-done-all" size={25} color={'red'} />
                      )}
                    </Text>
                  </ScrollView>
                </View>
              )}
              ItemSeparatorComponent={this.renderSeparator}
            />
            <Text />
            {this.state.modifyItem && (
              <Portal>
                <Dialog
                  visible={this.state.detailPortal}
                  onDismiss={() => this.hideDetailPortal(false)}>
                  <Dialog.Title>Detail</Dialog.Title>
                  <Dialog.Content>
                    <Paragraph>
                      Name: {this.state.modifyItem.name} {'\n'}
                      Date created: {this.state.modifyItem.date} {'\n'}
                      Completed:{this.state.modifyItem.completed ? 'Yes' : 'No'}
                    </Paragraph>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button
                      color={themeColor}
                      onPress={() => this.hideDetailPortal(false)}>
                      Close
                    </Button>
                    <Button
                      color={themeColor}
                      onPress={() =>
                        this.markComplete(
                          !this.state.modifyItem.completed,
                          this.state.modifyItem,
                        )
                      }>
                      {this.state.modifyItem.completed
                        ? 'Mark Incomplete'
                        : 'Mark Complete'}
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            )}
            <Portal>
              <Dialog
                visible={this.state.confirmVisible}
                onDismiss={() => this.hideDialog(false)}>
                <Dialog.Title>Confirm</Dialog.Title>
                <Dialog.Content>
                  <Paragraph>Are you sure you want to delete this?</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    color={themeColor}
                    onPress={() => this.hideDialog(true)}>
                    Yes
                  </Button>
                  <Button
                    color={themeColor}
                    onPress={() => this.hideDialog(false)}>
                    No
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </ScrollView>
          <Snackbar
            style={{backgroundColor: themeColor}}
            visible={this.state.snackbarVisible}
            onDismiss={() => this.setState({snackbarVisible: false})}
            action={{
              label: 'Undo',
              onPress: () => {
                this.undoDeleteItem();
              },
            }}>
            Item deleted successfully.
          </Snackbar>
        </View>
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 38 : 22,
    backgroundColor: '#F5FFFA',
    paddingHorizontal: 5,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
    alignItems: 'center',
  },
});
