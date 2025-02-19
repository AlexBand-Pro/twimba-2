import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let moduleOpen = false

let storedData = JSON.parse(localStorage.getItem("data")) || tweetsData;
localStorage.setItem("data", JSON.stringify(storedData));

storedData.forEach((tweet) => {
    tweet.repliesOpened  = false
    localStorage.setItem("data", JSON.stringify(storedData));
})


document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    } else if (e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    } else if (e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    } else if (e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    } else if (e.target.dataset.response) {
        openReplyModule(e.target.dataset.response, e.target)
    } else if (e.target.dataset.trash) {
        handleDeleteTweetBtn(e.target.dataset.trash)
    } else if (e.target.dataset.delbtn) {
        deleteReply(e.target.dataset.delbtn, e.target)
    }
    
    if (moduleOpen && e.target.id === "dark-background") {
        moduleOpen = false
        closeModule()
    }
})

function deleteReply (tweetId, target) {
    const targetTweetObj = fetchTargetArray(tweetId)
    const replies = targetTweetObj.replies.filter((reply) => {
        return reply.id != target.id
    })
    targetTweetObj.replies = replies
    localStorage.setItem("data", JSON.stringify(storedData))
    render()
}

 
function handleLikeClick(tweetId){
    const targetTweetObj = fetchTargetArray(tweetId)

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    localStorage.setItem("data", JSON.stringify(storedData))
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = fetchTargetArray(tweetId)
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    localStorage.setItem("data", JSON.stringify(storedData))
    render() 
}

function handleReplyClick(tweetId){
    const targetTweet = fetchTargetArray(tweetId)
    targetTweet.repliesOpened = !targetTweet.repliesOpened
    render()
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        storedData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            repliesOpened: false,
            uuid: uuidv4(),
            isDeletable: true
        })
        localStorage.setItem("data", JSON.stringify(storedData))
    render()
    tweetInput.value = ''
    }

}

function handleDeleteTweetBtn (tweetId) {
    const targetTweet = fetchTargetArray(tweetId)
    storedData.forEach((tweet, index) => {
        if (targetTweet.uuid === tweet.uuid) {
            storedData.splice(index, 1)
        }
    })
    localStorage.setItem("data", JSON.stringify(storedData))
    render()
}

function fetchTargetArray (tweetId) {
    const targetTweet = storedData.filter((tweet) => {
        return tweet.uuid === tweetId
    })[0]
    
    return targetTweet
}

function openReplyModule (tweetId, target) {
    document.querySelector(".reply-module").classList.remove("hidden")
    document.querySelector(".darkened-background").classList.remove("hidden")
    document.body.classList.add("removed-scroll")
    setTimeout(() => {
        moduleOpen = true
    }, 300)
    const replyHandler = () => {
        postReply(tweetId)
        document.getElementById("post-reply-btn").removeEventListener("click", replyHandler);
    }
    document.getElementById("post-reply-btn").addEventListener("click", replyHandler);
}

function closeModule () {
    document.getElementById("reply-input").value = ""
    document.querySelector(".reply-module").classList.add("hidden")
    document.querySelector(".darkened-background").classList.add("hidden")
    document.body.classList.remove("removed-scroll")
    render()  
}

function postReply (tweetId) {
    if (!document.getElementById("reply-input").value) {
        return
    }
    moduleOpen = false
    const requiredTweetObj = storedData.filter((tweet) => {
        return tweetId === tweet.uuid
    })[0]
    requiredTweetObj.replies.unshift(
        {
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: document.getElementById("reply-input").value,
            userPosted: true,
            id: requiredTweetObj.replies.length
        }
    )
    localStorage.setItem("data", JSON.stringify(storedData))
    closeModule()        
}

function getFeedHtml(){
    let feedHtml = ``
    
    storedData.forEach(function(tweet){
        const likeIconClass = tweet.isLiked ? "liked" : null
        const retweetIconClass = tweet.isRetweeted ? 'retweeted' : null
        let deleteIcon = ""
        if (tweet.isDeletable) {
            deleteIcon = `
                <span class="tweet-detail" id="trash-icon-detail">
                    <i class="fa-solid fa-trash-can" data-trash="${tweet.uuid}"></i>
                </span>
            `
        }
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                let deleteReplyBtn = ""
                if (reply.userPosted) {
                    deleteReplyBtn = `<i id="${reply.id}" class="fa-solid fa-trash-can fa-xs" data-delbtn="${tweet.uuid}"></i>`
                }

                repliesHtml+=`
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="profile-pic">
                        <div>
                            <div class="handler-container">
                                <p class="handle">${reply.handle}</p> ${deleteReplyBtn}
                            </div>
                            <p class="tweet-text">${reply.tweetText}</p>
                        </div>
                    </div>
                </div>
                `
            })
        }
        
        const displayRepliesClass = tweet.repliesOpened ? "" : "hidden"
          
        feedHtml += `
        <div class="tweet">
            <div class="tweet-inner">
                <img src="${tweet.profilePic}" class="profile-pic">
                <div>
                    <p class="handle">${tweet.handle}</p>
                    <p class="tweet-text">${tweet.tweetText}</p>
                    <div class="tweet-details">
                        <span class="tweet-detail">
                            <i class="fa-regular fa-comment-dots"
                            data-reply="${tweet.uuid}"
                            ></i>
                            ${tweet.replies.length}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-heart ${likeIconClass}"
                            data-like="${tweet.uuid}"
                            ></i>
                            ${tweet.likes}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-retweet ${retweetIconClass}"
                            data-retweet="${tweet.uuid}"
                            ></i>
                            ${tweet.retweets}
                        </span>
                        ${deleteIcon}
                    </div>   
                </div>            
            </div>
            <div class="${displayRepliesClass} center" id="replies-${tweet.uuid}">
                <div class="reply-btn-holder"><button class="reply-btn" id="btn-${tweet.uuid}" data-response="${tweet.uuid}">Reply</button></div>
                ${repliesHtml}
            </div>   
        </div>
        `
   })
   return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()

