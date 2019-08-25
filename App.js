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
  apiKey: '<API_KEY>',
  authDomain: '<PROJECT_ID>.firebaseapp.com',
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com',
  projectId: '<PROJECT_ID>',
  storageBucket: '<BUCKET>.appspot.com',
  messagingSenderId: '<SENDER_ID>',
};

let themeColor = '#ff0066';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    if (!firebaseApp.apps.length) {
      firebaseApp.initializeApp(Config);
    }
    this.tasksRef = firebaseApp.database().ref('/items');

    const dataSource = [];
    this.state = {
      dataSource: dataSource,
      selecteditem: null,
      snackbarVisible: false,
      confirmVisible: false,
    };
  }

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
    let updates = {};
    updates['/items/' + key] = null;
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

    let updates = {};
    updates['/items/' + newPostKey] = {
      name:
        itemName === '' || itemName === undefined
          ? this.state.itemname
          : itemName,
    };

    return firebaseApp
      .database()
      .ref()
      .update(updates);
  }

  updateItem() {
    let updates = {};
    updates['/items/' + this.state.selecteditem.key] = {
      name: this.state.itemname,
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

  showDialog() {
    this.setState({confirmVisible: true});
    console.log('in show dialog');
  }

  undoDeleteItem() {
    this.addItem(this.state.deleteItem.name);
  }

  render() {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{flex: 1}}>
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
                  </ScrollView>
                </View>
              )}
              ItemSeparatorComponent={this.renderSeparator}
            />
            <Text />

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
