# from rag_agent.indexer import CHECKLIST_FOLDER_IDS
from rag_agent.agent import agent

if __name__ == "__main__":

    # 예시 질의
    user_query = input("질의어 입력: ")
    out = agent.invoke(user_query)
    print("\n===== 결과 =====\n")
    print(out)
