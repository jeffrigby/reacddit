import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/types/redux';
import { siteSettings } from '../../../redux/slices/siteSettingsSlice';

function PinMenu() {
  const pinMenuSetting = useSelector(
    (state: RootState) => state.siteSettings.pinMenu
  );
  const dispatch = useDispatch<AppDispatch>();

  const togglePinMenu = () => {
    if (pinMenuSetting) {
      document.body.classList.remove('show-menu');
      document.body.classList.add('hide-menu');
    }
    dispatch(siteSettings({ pinMenu: !pinMenuSetting }));
  };

  const buttonClass = pinMenuSetting ? 'light' : 'secondary';

  return (
    <button
      aria-label="Pin Menu"
      className={`btn btn-${buttonClass} btn-sm`}
      type="button"
      onClick={togglePinMenu}
    >
      <i className="fas fa-thumbtack" />
    </button>
  );
}

export default PinMenu;
