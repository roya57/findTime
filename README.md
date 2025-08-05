# FindTime - Group Scheduling Made Easy

FindTime is a modern web application that helps teams and groups find the perfect meeting time that works for everyone. Built with React and featuring a beautiful, intuitive interface.

## ✨ Features

### 🎯 **Smart Event Creation**
- **Flexible Date Selection**: Choose between specific dates or recurring days of the week
- **Customizable Time Windows**: Set start time, end time, and meeting duration
- **Event Details**: Add title, description, and participant information

### 👥 **Participant Management**
- **Easy Invitation**: Add participants by name and email
- **Real-time Updates**: See participant count and availability instantly
- **Simple Interface**: Clean, intuitive participant management

### 📅 **Visual Availability Grid**
- **Interactive Calendar**: Click to mark availability for each participant
- **Smart Time Slots**: Automatically calculates optimal meeting durations
- **Best Times Display**: Shows the most popular available time slots
- **Visual Feedback**: Color-coded availability with participant counts

### 🔗 **Share & Collaborate**
- **Unique URLs**: Each event gets a shareable link
- **Persistent Storage**: Events are saved and accessible via URL
- **Cross-Device Access**: Works on any device or browser
- **Real-time Updates**: Changes are saved automatically

## 🚀 **Getting Started**

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/findTime.git
   cd findTime
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 **How to Use**

### Creating an Event
1. **Fill out the event form** with title, description, and time preferences
2. **Choose date type**: Specific dates or days of the week
3. **Set time window**: Choose start time, end time, and duration
4. **Click "Create Event"** to generate a unique shareable URL

### Adding Participants
1. **Enter participant details**: Name and email address
2. **Click "Add"** to add them to the event
3. **Repeat** for all participants

### Marking Availability
1. **Select a participant** from the dropdown
2. **Click on time slots** in the grid to mark availability
3. **See real-time updates** as availability is marked
4. **View best times** automatically calculated

### Sharing with Participants
1. **Copy the share URL** from the event details
2. **Send to participants** via email, messaging, etc.
3. **Participants can access** the event and mark their availability
4. **Everyone sees updates** in real-time

## 🛠️ **Technology Stack**

- **Frontend**: React 18 with Vite
- **Routing**: React Router DOM
- **Styling**: Custom CSS with modern design
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: localStorage (with plans for database integration)

## 🎨 **Design Features**

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Accessible**: Proper labels, keyboard navigation, and screen reader support
- **Interactive**: Smooth animations and hover effects
- **Color-coded**: Visual indicators for availability and best times

## 🔮 **Future Enhancements**

- [ ] **Database Integration**: Real-time collaboration with Firebase/Supabase
- [ ] **User Authentication**: Secure user accounts and event ownership
- [ ] **Email Notifications**: Automatic reminders and updates
- [ ] **Calendar Integration**: Export to Google Calendar, Outlook, etc.
- [ ] **Recurring Events**: Support for weekly/monthly recurring meetings
- [ ] **Time Zone Support**: Handle participants in different time zones
- [ ] **Mobile App**: Native iOS and Android applications

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with ❤️ using React and modern web technologies
- Inspired by the need for better group scheduling tools
- Icons provided by [Lucide](https://lucide.dev/)

---

**FindTime** - Making group scheduling simple and beautiful. 