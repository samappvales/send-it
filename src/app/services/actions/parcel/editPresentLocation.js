import * as api from '../../apiRequests';
import { retrieveAuthUser } from "../../localStorage";
import events from '../../events/events';
import subscriptions from '../../events/subscriptions';
import Toast from '../../../components/Toast';

const editPresentLocation = async (parcelId) => {
  const authUser = retrieveAuthUser();

  let token = authUser.token;
  const data = window.app.store.editPresentLocationData;
  const canProceed = window.app.store['editPresentLocationCanProceed'];
  const actionBox = document.getElementById('editPresentLocation-action-button');

  if(canProceed) {
    try {
      events.emit(
        subscriptions.REQUEST_PENDING, 
        {actionBox, action: 'editPresentLocation', normalText: 'Save'}
      );
      Toast.show({ message: 'Request processing', autoHide: false, type: 'pending'});

      const response = await api.editPresentLocation(data, parcelId, token);
      
      // store the parcels data in the window.app.state namespace
      window.app.state['selectedParcel'] = response.data;

      events.emit(
        subscriptions.EDIT_PARCEL_ORDER_SUCCESS,
        response.data
      );

      Toast.show({ message: 'Request completed', type: 'success'});
    }
    catch(error) {
      Toast.show({ message: 'Request failed', type: 'error'});
      events.emit(
        subscriptions.REQUEST_DONE, 
        {actionBox, action: 'editPresentLocation', normalText: 'Save'}
      );
    }
  } else { 
    Toast.show({ message: 'No edit made', type: 'error'});
  }
  

}

export default editPresentLocation;