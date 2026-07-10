import useObligationsStore from "../../store/obligationsStore";
import { useSSE } from "../../hooks/useSSE";

import './header.css';

export default function Header () {
  const totals = useObligationsStore(
    (state) => state.getCurrentMonthTotal()
  );
  const totalEntries = Object.entries(totals);

  const { status } = useSSE();

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#4CAF50';
      case 'reconnecting':
        return '#FFA726';
      case 'connecting':
        return '#FFA726';
      default:
        return '#BDBDBD';
    }
  };

  return (
    <header className="nameStatus">
      <h2>Мои обязательства</h2>
      <span
        className="status-dot"
        style={{
          backgroundColor: getStatusColor(),
        }}
      />
      <div className="totals">
        {totalEntries.length === 0 ? (
          <span>Нет платежей</span>
        ) : (
          totalEntries.map(([currency, amount], index) => (
            <span key={currency}>
              {amount} {currency}
              {index < totalEntries.length - 1 && ' · '}
            </span>
          ))
        )}
      </div>
    </header>
  );
}