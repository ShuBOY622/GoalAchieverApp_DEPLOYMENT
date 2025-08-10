export interface Goal {
  id: number;
  title: string;
  description: string;
  createdBy: number;
  type: 'PERSONAL' | 'SHARED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  deadline: string;
  createdAt: string;
  assignments: GoalAssignment[];
}

export interface GoalAssignment {
  userId: number;
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  completedAt?: string;
  lastUpdated: string;
}

export interface CreateGoalData {
  title: string;
  description: string;
  createdBy: number;
  type: 'PERSONAL' | 'SHARED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  deadline: string;
  assignedUserIds?: number[];
}
