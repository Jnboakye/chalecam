import React, { useEffect } from 'react';

const CreateEventScreen = ({ navigation }) => {
  useEffect(() => {
    // Replace this screen with EventName so back button goes to home
    navigation.replace('EventName', { eventData: {} });
  }, [navigation]);

  return null;
};

export default CreateEventScreen;

