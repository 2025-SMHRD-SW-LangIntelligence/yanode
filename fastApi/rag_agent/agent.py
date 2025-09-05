import os
from langchain_openai import ChatOpenAI
from langchain.agents import Tool, initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory

from rag_agent.api import list_personal_drives
from rag_agent.indexer import CHECKLIST_FOLDER_IDS, _ext_lower, _walk_from
# 미리보기 툴 제외: from rag_agent.router import dooray_auto_preview

# >>> 오토프리뷰 공용 함수 import (툴만 등록해서 사용)
from rag_agent.ops_dooray import dooray_auto_preview
# ===== LLM =====
MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
llm = ChatOpenAI(model=MODEL_NAME, temperature=0, max_tokens=1000)

# ===== 프롬프트 =====
DEFAULT_AGENT_PREFIX = (
    "너는 '출력 포맷터'다. 반드시 도구의 결과만 사용해 최종 답을 만든다.\n"
    "dooray_auto_preview 도구는 다음 키=값 라인을 반환한다:\n"
    "__TOP1_NAME__, __TOP1_PATH__, __TOP1_EXT__, __TOP1_URL__, __TOP1_PREVIEW__.\n"
)
DEFAULT_AGENT_SUFFIX = (
    "작업 절차는 항상 동일하다.\n"
    "1) 반드시 한 번만 Action: dooray_auto_preview 를 호출하여 Observation을 얻는다.\n"
    "2) Observation을 점검해 출력 형태를 결정한다.\n"
    "   - Observation에 '관련 파일을 찾지 못했습니다' 또는 '선택한 폴더 범위 내에서' 문구가 있으면 '미발견' 케이스다.\n"
    "   - 그렇지 않으면 '발견' 케이스다.\n"
    "3) 두 케이스 모두 최종 출력은 반드시 'Final Answer:' 로 시작한다. Thought/Action 등의 단어를 출력하지 말 것.\n"
    "\n"
    "[발견 케이스 — 정확히 6줄]\n"
    "Final Answer:\n"
    "파일명: <__TOP1_NAME__ 또는 ->\n"
    "경로: <__TOP1_PATH__ 또는 ->\n"
    "요약: <__TOP1_PREVIEW__에서 1~2문장 한국어 요약 또는 ->\n"
    ": <__TOP1_URL__ 또는 ->\n"
    "찾으시는 파일이 아니면 체크리스트를 확인해주세요!\n"
    "\n"
    "[미발견 케이스 — 정확히 3줄]\n"
    "Final Answer:\n"
    "관련 파일을 찾지 못했습니다\n"
    "체크리스트를 확인해주세요!\n"
    "\n"
    "Question: {input}\n"
    "{agent_scratchpad}"
)

AGENT_PREFIX = os.getenv("AGENT_PREFIX", DEFAULT_AGENT_PREFIX)
AGENT_SUFFIX = os.getenv("AGENT_SUFFIX", DEFAULT_AGENT_SUFFIX)

# ===== 도구 등록 (오토프리뷰만) =====
dooray_autopreview_tool = Tool(
    name="dooray_auto_preview",
    func=lambda q: dooray_auto_preview(q),
    description=(
        "질의어로 문서를 찾아 Top1을 선별하고, 다음 키=값 라인을 포함해 반환한다: "
        "__TOP1_NAME__, __TOP1_PATH__, __TOP1_EXT__, __TOP1_URL__, __TOP1_PREVIEW__."
    ),
)

tools = [dooray_autopreview_tool]

# --- 에이전트 생성부 ---

def make_agent():
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    return initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True,
        memory=memory,
        max_iterations=2,                  # (1) 툴 호출, (2) 최종 답
        early_stopping_method="generate",
        handle_parsing_errors=(
            "Final Answer:\n파일명: -\n경로: -\n요약: 해당 범위에서 결과 없음\n찾으시는 파일이 아니면 체크리스트를 확인해주세요!"
        ),
        agent_kwargs={
            "prefix": AGENT_PREFIX,
            "suffix": AGENT_SUFFIX,
            "input_variables": ["input", "chat_history", "agent_scratchpad", "tools", "tool_names"],
        },
    )
