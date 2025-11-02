import { Card, Avatar, List, Typography, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TabBar from '../components/TabBar';

const { Title, Text } = Typography;

// 模拟数据
const userInfo = {
  nickname: '用户昵称',
  avatar: 'https://via.placeholder.com/100', // 占位头像
  goal: '减重5kg'
};

const calorieData = [
  { date: '2023-09-01', calories: 1800 },
  { date: '2023-09-02', calories: 1900 },
  { date: '2023-09-03', calories: 1700 },
  { date: '2023-09-04', calories: 2000 },
  { date: '2023-09-05', calories: 1850 },
  { date: '2023-09-06', calories: 1950 },
  { date: '2023-09-07', calories: 1750 },
];

const recentRecords = [
  { id: 1, date: '2023-09-07', calories: 1750, meal: '早餐: 燕麦粥; 午餐: 沙拉; 晚餐: 鸡胸肉' },
  { id: 2, date: '2023-09-06', calories: 1950, meal: '早餐: 面包; 午餐: 面条; 晚餐: 蔬菜' },
  { id: 3, date: '2023-09-05', calories: 1850, meal: '早餐: 水果; 午餐: 米饭; 晚餐: 鱼' },
  { id: 4, date: '2023-09-04', calories: 2000, meal: '早餐: 牛奶; 午餐: 汉堡; 晚餐: 薯条' },
  { id: 5, date: '2023-09-03', calories: 1700, meal: '早餐: 蛋糕; 午餐: 披萨; 晚餐: 冰淇淋' },
  { id: 6, date: '2023-09-02', calories: 1900, meal: '早餐: 咖啡; 午餐: 三明治; 晚餐: 寿司' },
  { id: 7, date: '2023-09-01', calories: 1800, meal: '早餐: 果汁; 午餐: 炒菜; 晚餐: 汤' },
  { id: 8, date: '2023-08-31', calories: 2100, meal: '早餐: 饼干; 午餐: 快餐; 晚餐: 甜点' },
  { id: 9, date: '2023-08-30', calories: 1650, meal: '早餐: 酸奶; 午餐: 沙拉; 晚餐: 水果' },
  { id: 10, date: '2023-08-29', calories: 1950, meal: '早餐: 面包; 午餐: 面条; 晚餐: 蔬菜' },
];

export default function Panel() {
  return (
    <div style={{ 
      width: '100vw',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      justifyContent: 'center',
      padding: '20px 0'
    }}>
      <div style={{ 
        width: '90%', 
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingTop: '80px' // 增加顶部距离，避免被TabBar遮挡
      }}>
        <TabBar />
        
        {/* 我的信息 */}
        <Card style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <Row align="middle" gutter={16} justify="center">
            <Col>
              <Avatar size={64} src={userInfo.avatar} />
            </Col>
            <Col>
              <Title level={4} style={{ color: 'white', margin: 0 }}>{userInfo.nickname}</Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>减肥目标: {userInfo.goal}</Text>
            </Col>
          </Row>
        </Card>
        
        {/* 折线图 */}
        <Card style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(168, 237, 234, 0.3)'
        }}>
          <Title level={4} style={{ color: '#2c3e50', marginBottom: '20px' }}>饮食热量变化</Title>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="calories" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        
        {/* 最近10次记录 */}
        <Card style={{
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(252, 182, 159, 0.3)'
        }}>
          <Title level={4} style={{ color: '#2c3e50', marginBottom: '20px' }}>最近10次饮食热量记录</Title>
          <List
            dataSource={recentRecords}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`${item.date} - ${item.calories} 卡路里`}
                  description={item.meal}
                />
              </List.Item>
            )}
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          />
        </Card>
      </div>
    </div>
  );
}
